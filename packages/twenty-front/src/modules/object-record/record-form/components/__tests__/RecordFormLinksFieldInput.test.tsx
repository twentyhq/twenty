import { RecordFormLinksFieldInput } from '@/object-record/record-form/components/RecordFormLinksFieldInput';
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

describe('RecordFormLinksFieldInput', () => {
  it('shows a single input named after the field', () => {
    render(
      <RecordFormLinksFieldInput label="Domain Name" onChange={() => {}} />,
      { wrapper: I18nWrapper },
    );

    expect(screen.getByLabelText('Domain Name')).toHaveAttribute(
      'placeholder',
      'URL',
    );
    expect(screen.queryByText('Primary Link Label')).not.toBeInTheDocument();
    expect(screen.queryByText('Secondary Links')).not.toBeInTheDocument();
  });

  it('asks for a domain on domain links fields', () => {
    render(
      <RecordFormLinksFieldInput
        label="Domain Name"
        linksVariant="domain"
        onChange={() => {}}
      />,
      { wrapper: I18nWrapper },
    );

    expect(screen.getByLabelText('Domain Name')).toHaveAttribute(
      'placeholder',
      'Domain',
    );
  });

  it('sets the primary link URL and keeps the other link parts', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <RecordFormLinksFieldInput
        label="Website"
        defaultValue={{
          primaryLinkLabel: 'Acme',
          primaryLinkUrl: '',
          secondaryLinks: [{ label: null, url: 'https://acme.org' }],
        }}
        onChange={onChange}
      />,
      { wrapper: I18nWrapper },
    );

    await user.type(screen.getByLabelText('Website'), 'acme.com');

    expect(onChange).toHaveBeenLastCalledWith({
      primaryLinkLabel: 'Acme',
      primaryLinkUrl: 'acme.com',
      secondaryLinks: [{ label: null, url: 'https://acme.org' }],
    });
  });
});
