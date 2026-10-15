import { RecordFormFieldInput } from '@/object-record/record-form/components/RecordFormFieldInput';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

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

jest.mock('@/object-record/record-field/ui/components/FormFieldInput', () => ({
  FormFieldInput: ({ field }: { field: { label: string } }) => (
    <div>{`All parts of ${field.label}`}</div>
  ),
}));

const I18nWrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderFieldInput = (type: FieldMetadataType, label: string) =>
  render(
    <RecordFormFieldInput
      field={{ type, label, metadata: { fieldName: label, settings: null } }}
      defaultValue={null}
      onChange={() => {}}
    />,
    { wrapper: I18nWrapper },
  );

describe('RecordFormFieldInput', () => {
  it('asks only for the URL of a links field', () => {
    renderFieldInput(FieldMetadataType.LINKS, 'Website');

    expect(screen.getByLabelText('Website')).toHaveAttribute(
      'placeholder',
      'URL',
    );
  });

  it('uses the example placeholder of the form when given one', () => {
    render(
      <RecordFormFieldInput
        field={{
          type: FieldMetadataType.LINKS,
          label: 'Website',
          metadata: { fieldName: 'website', settings: null },
        }}
        defaultValue={null}
        onChange={() => {}}
        placeholder="twenty.com"
      />,
      { wrapper: I18nWrapper },
    );

    expect(screen.getByLabelText('Website')).toHaveAttribute(
      'placeholder',
      'twenty.com',
    );
  });

  it('asks only for the primary email of an emails field', () => {
    renderFieldInput(FieldMetadataType.EMAILS, 'Emails');

    expect(screen.getByLabelText('Emails')).toHaveAttribute(
      'placeholder',
      'Email',
    );
  });

  it.each([
    [FieldMetadataType.ADDRESS, 'Address'],
    [FieldMetadataType.CURRENCY, 'Amount'],
    [FieldMetadataType.PHONES, 'Phones'],
  ])('keeps every part of a %s field', (type, label) => {
    renderFieldInput(type, label);

    expect(screen.getByText(`All parts of ${label}`)).toBeInTheDocument();
  });
});
