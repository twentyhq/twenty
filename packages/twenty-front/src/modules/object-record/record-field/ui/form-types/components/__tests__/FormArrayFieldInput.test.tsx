import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormLinksFieldInput } from '@/object-record/record-field/ui/form-types/components/FormLinksFieldInput';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';

const renderWithProviders = (children: ReactNode) => {
  const store = createStore();

  return render(children, {
    wrapper: ({ children: wrappedChildren }) => (
      <I18nProvider i18n={i18n}>
        <Provider store={store}>{wrappedChildren}</Provider>
      </I18nProvider>
    ),
  });
};

const renderArrayField = ({
  defaultValue = [],
}: { defaultValue?: string[] } = {}) => {
  const onChange = jest.fn();
  renderWithProviders(
    <>
      <button>Before</button>
      <FormArrayFieldInput defaultValue={defaultValue} onChange={onChange} />
      <button>After</button>
    </>,
  );

  return { onChange };
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

it('trims the first item added with Enter', async () => {
  const user = userEvent.setup();
  const { onChange } = renderArrayField();
  const itemInput = screen.getByPlaceholderText('Enter an item');
  await user.click(itemInput);
  await user.type(itemInput, '  Draft item ');

  await user.keyboard('{Enter}');

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(['Draft item']);
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
