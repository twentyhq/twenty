import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormLinksFieldInput } from '@/object-record/record-field/ui/form-types/components/FormLinksFieldInput';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

const I18nWrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

it('tabs between number inputs used in workflow nodes in both directions', async () => {
  const user = userEvent.setup();
  render(
    <>
      <FormNumberFieldInput defaultValue={1} onChange={() => {}} />
      <FormNumberFieldInput defaultValue={2} onChange={() => {}} />
      <button>Save</button>
    </>,
  );
  const first = screen.getByDisplayValue('1');
  const second = screen.getByDisplayValue('2');
  await user.click(first);
  await user.tab();
  expect(second).toHaveFocus();
  await user.tab({ shift: true });
  expect(first).toHaveFocus();
  await user.tab();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
});

it('tabs out of an empty array field in both directions', async () => {
  const user = userEvent.setup();
  render(
    <>
      <button>Before</button>
      <FormArrayFieldInput defaultValue={[]} onChange={() => {}} />
      <button>After</button>
    </>,
    { wrapper: I18nWrapper },
  );
  const itemInput = screen.getByPlaceholderText('Enter an item');
  await user.click(itemInput);
  await user.tab();
  expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(itemInput).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
});

it('tabs through a links field and past its empty secondary links', async () => {
  const user = userEvent.setup();
  render(
    <>
      <FormLinksFieldInput
        label="Links"
        defaultValue={undefined}
        onChange={() => {}}
      />
      <button>Next field</button>
    </>,
    { wrapper: I18nWrapper },
  );
  const secondaryLinksInput = screen.getByPlaceholderText('Enter an item');
  await user.click(secondaryLinksInput);
  await user.tab();
  expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(secondaryLinksInput).toHaveFocus();
  await user.tab({ shift: true });
  expect(document.activeElement).toHaveAttribute('contenteditable', 'true');
});

it('closes an open multi-select list when Tab moves to the next field', async () => {
  const user = userEvent.setup();
  render(
    <I18nWrapper>
      <FormMultiSelectFieldInput
        label="Tags"
        defaultValue={[]}
        onChange={() => {}}
        options={[
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ]}
      />
      <button>Next</button>
    </I18nWrapper>,
  );
  await user.tab();
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Option B')).toBeInTheDocument();

  await user.tab();

  expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  expect(screen.queryByText('Option B')).not.toBeInTheDocument();
});

it('keeps the multi-select list open when an option is clicked', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(
    <I18nWrapper>
      <FormMultiSelectFieldInput
        label="Tags"
        defaultValue={[]}
        onChange={onChange}
        options={[
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ]}
      />
    </I18nWrapper>,
  );
  await user.click(screen.getByRole('button', { name: /Tags/ }));

  await user.click(await screen.findByText('Option B'));

  expect(onChange).toHaveBeenLastCalledWith(['b']);
  expect(screen.getByText('Option A')).toBeInTheDocument();
});

it('forgets the highlighted multi-select option once Tab closes the list', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(
    <I18nWrapper>
      <FormMultiSelectFieldInput
        label="Tags"
        defaultValue={[]}
        onChange={onChange}
        options={[
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ]}
      />
      <button>Next</button>
    </I18nWrapper>,
  );
  await user.tab();
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Option B')).toBeInTheDocument();
  await user.keyboard('{ArrowDown}');
  await user.tab();
  await user.tab({ shift: true });
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Option B')).toBeInTheDocument();

  await user.keyboard('{Enter}');

  expect(onChange).not.toHaveBeenCalled();

  await user.keyboard('{ArrowDown}{Enter}');

  expect(onChange).toHaveBeenCalledWith(['a']);
});
