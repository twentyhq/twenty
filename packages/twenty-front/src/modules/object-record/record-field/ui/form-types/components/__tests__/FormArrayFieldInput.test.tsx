import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormLinksFieldInput } from '@/object-record/record-field/ui/form-types/components/FormLinksFieldInput';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode, StrictMode } from 'react';

const renderWithProviders = (children: ReactNode) => {
  const store = createStore();

  const renderResult = render(children, {
    wrapper: ({ children: wrappedChildren }) => (
      <I18nProvider i18n={i18n}>
        <Provider store={store}>
          <StrictMode>{wrappedChildren}</StrictMode>
        </Provider>
      </I18nProvider>
    ),
  });

  return { ...renderResult, store };
};

const renderArrayField = ({
  defaultValue = [],
  maxItemCount,
}: { defaultValue?: string[]; maxItemCount?: number } = {}) => {
  const onChange = jest.fn();
  const { store } = renderWithProviders(
    <>
      <button>Before</button>
      <FormArrayFieldInput
        label="Items"
        defaultValue={defaultValue}
        onChange={onChange}
        maxItemCount={maxItemCount}
      />
      <button>After</button>
    </>,
  );

  return { onChange, store };
};

it.each([
  ['Tab', { shift: false }, 'After'],
  ['Shift+Tab', { shift: true }, 'Before'],
])(
  'adds the typed first item when %s leaves the array field',
  async (_key, tabOptions, nextButtonName) => {
    const user = userEvent.setup();
    const { onChange } = renderArrayField();
    const itemInput = screen.getByPlaceholderText('Enter an item');
    await user.click(itemInput);
    await user.type(itemInput, ' Draft item ');

    await user.tab(tabOptions);

    expect(screen.getByRole('button', { name: nextButtonName })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['Draft item']);
    expect(screen.getByText('Draft item')).toBeInTheDocument();
  },
);

it('trims the first item and opens its panel before mounting under StrictMode', async () => {
  const user = userEvent.setup();
  const { onChange } = renderArrayField();
  const itemInput = screen.getByPlaceholderText('Enter an item');
  await user.click(itemInput);
  await user.type(itemInput, '  Draft item ');

  await user.keyboard('{Enter}');

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(['Draft item']);
  const panel = await screen.findByRole('dialog', { name: 'Items' });
  expect(panel).toBeVisible();
  await waitFor(() =>
    expect(
      within(panel).getByRole('button', { name: 'More options' }),
    ).toHaveFocus(),
  );
});

it('edits an item through its nested menu while keeping the array panel open', async () => {
  const user = userEvent.setup();
  const { onChange } = renderArrayField({ defaultValue: ['First item'] });
  await user.click(screen.getByRole('button', { name: 'Items' }));

  const panel = await screen.findByRole('dialog', { name: 'Items' });
  await user.click(within(panel).getByText('First item'));

  expect(screen.queryByRole('menu')).not.toBeInTheDocument();

  await user.click(within(panel).getByRole('button', { name: 'More options' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));

  expect(panel).toBeVisible();

  const input = within(panel).getByRole('textbox');
  expect(input).toHaveValue('First item');
  await waitFor(() => expect(input).toHaveFocus());
  await user.clear(input);
  await user.type(input, 'Updated item{Enter}');

  expect(onChange).toHaveBeenLastCalledWith(['Updated item']);
  expect(panel).toBeVisible();
  expect(within(panel).queryByRole('textbox')).not.toBeInTheDocument();
});

it('dismisses one nested layer at a time and clears its focus entries', async () => {
  const user = userEvent.setup();
  const { store } = renderArrayField({ defaultValue: ['First item'] });
  await user.click(screen.getByRole('button', { name: 'Items' }));

  const panel = await screen.findByRole('dialog', { name: 'Items' });
  const menuTrigger = within(panel).getByRole('button', {
    name: 'More options',
  });
  const parentFocusStack = store.get(focusStackState.atom);

  await user.click(menuTrigger);
  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
  expect(panel).toBeVisible();
  expect(store.get(focusStackState.atom)).toEqual(parentFocusStack);
  await waitFor(() => expect(menuTrigger).toHaveFocus());

  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(store.get(focusStackState.atom)).toEqual([]);
});

it('clears the uncommitted new item when Escape closes its panel', async () => {
  const user = userEvent.setup();
  const { onChange } = renderArrayField({ defaultValue: ['First item'] });
  const trigger = screen.getByRole('button', { name: 'Items' });
  await user.click(trigger);
  await user.click(await screen.findByRole('button', { name: 'Add item' }));
  await user.type(screen.getByRole('textbox'), 'Uncommitted{Escape}');

  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(onChange).not.toHaveBeenCalled();

  await user.click(trigger);
  await user.click(await screen.findByRole('button', { name: 'Add item' }));

  expect(screen.getByRole('textbox')).toHaveValue('');
});

it('enforces the item limit and allows adding again after deleting an item', async () => {
  const user = userEvent.setup();
  const { onChange } = renderArrayField({
    defaultValue: ['First item'],
    maxItemCount: 2,
  });
  await user.click(screen.getByRole('button', { name: 'Items' }));
  await user.click(await screen.findByRole('button', { name: 'Add item' }));
  await user.type(screen.getByRole('textbox'), 'Second item{Enter}');

  expect(onChange).toHaveBeenLastCalledWith(['First item', 'Second item']);
  expect(
    screen.queryByRole('button', { name: 'Add item' }),
  ).not.toBeInTheDocument();

  const panel = screen.getByRole('dialog', { name: 'Items' });
  await user.click(
    within(panel).getAllByRole('button', { name: 'More options' })[1],
  );
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));

  expect(onChange).toHaveBeenLastCalledWith(['First item']);
  expect(panel).toBeVisible();
  expect(within(panel).getByRole('button', { name: 'Add item' })).toBeVisible();
});

it('adds the typed first item when focus moves to another element', async () => {
  const user = userEvent.setup();
  const { onChange } = renderArrayField();
  const itemInput = screen.getByPlaceholderText('Enter an item');
  await user.click(itemInput);
  await user.type(itemInput, 'Draft item');

  await user.click(screen.getByRole('button', { name: 'After' }));

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(['Draft item']);
});

it('keeps the typed first item in the input when focus leaves to nothing focusable', async () => {
  const user = userEvent.setup();
  const { onChange } = renderArrayField();
  const itemInput = screen.getByPlaceholderText('Enter an item');
  await user.click(itemInput);
  await user.type(itemInput, 'Draft item');

  await user.click(document.body);

  expect(onChange).not.toHaveBeenCalled();
  expect(itemInput).toHaveValue('Draft item');
});

it('adds the typed new item when focus moves to another element', async () => {
  const user = userEvent.setup();
  const { onChange } = renderArrayField({ defaultValue: ['First item'] });
  await user.click(screen.getByText('First item'));
  await user.click(await screen.findByText('Add item'));
  await user.type(screen.getByRole('textbox'), 'Second item');

  await user.click(screen.getByRole('button', { name: 'After' }));

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(['First item', 'Second item']);
});

it('keeps a blank first item draft in place without adding it when Tab leaves the field', async () => {
  const user = userEvent.setup();
  const { onChange } = renderArrayField();
  const itemInput = screen.getByPlaceholderText('Enter an item');
  await user.click(itemInput);
  await user.type(itemInput, '   ');

  await user.tab();
  expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  await user.tab({ shift: true });

  expect(onChange).not.toHaveBeenCalled();
  expect(itemInput).toHaveFocus();
  expect(itemInput).toHaveValue('   ');
});

it('adds the typed secondary link when Tab leaves the links field', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  renderWithProviders(
    <>
      <FormLinksFieldInput
        label="Links"
        defaultValue={undefined}
        onChange={onChange}
      />
      <button>Next field</button>
    </>,
  );
  const secondaryLinksInput = screen.getByPlaceholderText('Enter an item');
  await user.click(secondaryLinksInput);
  await user.type(secondaryLinksInput, 'twenty.com');

  await user.tab();

  expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith({
    primaryLinkLabel: '',
    primaryLinkUrl: '',
    secondaryLinks: [{ url: 'twenty.com', label: null }],
  });
});
