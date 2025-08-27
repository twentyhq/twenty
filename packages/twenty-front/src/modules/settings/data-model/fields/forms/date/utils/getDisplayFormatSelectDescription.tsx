import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Trans } from '@lingui/react/macro';

export const getDisplayFormatSelectDescription = (
  selectedDisplayFormat: FieldDateDisplayFormat,
) => {
  if (selectedDisplayFormat === FieldDateDisplayFormat.CUSTOM) {
    return (
      <Trans>
        Enter in{' '}
        <a
          href="https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline', color: 'inherit' }}
        >
          Unicode
        </a>{' '}
        format
      </Trans>
    );
  }
  return <Trans>Choose the format used to display date value</Trans>;
};
