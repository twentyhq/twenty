import { RecordFormEmailsFieldInput } from '@/object-record/record-form/components/RecordFormEmailsFieldInput';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormTextFieldInput',
  () => ({
    FormTextFieldInput: ({
      label,
      defaultValue,
      placeholder,
      onChange,
    }: {
      label?: string;
      defaultValue?: string | null;
      placeholder?: string;
      onChange: (value: string) => void;
    }) => (
      <label>
        {label}
        <input
          defaultValue={defaultValue ?? ''}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    ),
  }),
);

const I18nWrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

describe('RecordFormEmailsFieldInput', () => {
  it('shows a single email input named after the field', () => {
    render(<RecordFormEmailsFieldInput label="Emails" onChange={() => {}} />, {
      wrapper: I18nWrapper,
    });

    expect(screen.getByLabelText('Emails')).toHaveAttribute(
      'placeholder',
      'Email',
    );
    expect(screen.queryByText('Primary Email')).not.toBeInTheDocument();
  });

  it('sets the primary email and keeps the additional emails', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <RecordFormEmailsFieldInput
        label="Emails"
        defaultValue={{
          primaryEmail: '',
          additionalEmails: ['ops@acme.com'],
        }}
        onChange={onChange}
      />,
      { wrapper: I18nWrapper },
    );

    await user.type(screen.getByLabelText('Emails'), 'ceo@acme.com');

    expect(onChange).toHaveBeenLastCalledWith({
      primaryEmail: 'ceo@acme.com',
      additionalEmails: ['ops@acme.com'],
    });
  });
});
