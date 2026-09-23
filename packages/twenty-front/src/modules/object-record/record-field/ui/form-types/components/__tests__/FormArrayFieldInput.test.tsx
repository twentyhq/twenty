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

const renderArrayField = () => {
  const onChange = jest.fn();
  renderWithProviders(
    <>
      <button>Before</button>
      <FormArrayFieldInput defaultValue={[]} onChange={onChange} />
      <button>After</button>
    </>,
  );

  return { onChange, itemInput: screen.getByPlaceholderText('Enter an item') };
};

it.each([
  ['Tab', { shift: false }, 'After'],
  ['Shift+Tab', { shift: true }, 'Before'],
])(
  'adds the typed first item when %s leaves the array field',
  async (_key, tabOptions, nextButtonName) => {
    const user = userEvent.setup();
    const { onChange, itemInput } = renderArrayField();
    await user.click(itemInput);
    await user.type(itemInput, ' Draft item ');

    await user.tab(tabOptions);

    expect(screen.getByRole('button', { name: nextButtonName })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['Draft item']);
    expect(screen.getByText('Draft item')).toBeInTheDocument();
  },
);

it('adds the typed first item when the array field loses focus', async () => {
  const user = userEvent.setup();
  const { onChange, itemInput } = renderArrayField();
  await user.click(itemInput);
  await user.type(itemInput, 'Draft item');

  await user.click(document.body);

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(['Draft item']);
});

it('adds the first item only once when Enter is pressed before leaving the field', async () => {
  const user = userEvent.setup();
  const { onChange, itemInput } = renderArrayField();
  await user.click(itemInput);
  await user.type(itemInput, 'Draft item');

  await user.keyboard('{Enter}');
  await user.click(document.body);

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(['Draft item']);
});

it('keeps a blank first item draft in place without adding it when Tab leaves the field', async () => {
  const user = userEvent.setup();
  const { onChange, itemInput } = renderArrayField();
  await user.click(itemInput);
  await user.type(itemInput, '   ');

  await user.tab();
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
