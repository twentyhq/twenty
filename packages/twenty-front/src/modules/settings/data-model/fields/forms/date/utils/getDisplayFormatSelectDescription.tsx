import { FieldDateDisplayFormat } from '@/object-record/record-field/types/FieldMetadata';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

export const getDisplayFormatSelectDescription = (
  selectedDisplayFormat: FieldDateDisplayFormat,
) => {
  if (selectedDisplayFormat === FieldDateDisplayFormat.CUSTOM) {
    return (
      <>
        <Trans>Enter in</Trans>{' '}
        <a
          href="https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans>Unicode</Trans>
        </a>{' '}
        <Trans>format</Trans>{' '}
      </>
    );
  } else {
    return t`Choose the format used to display date value`;
  }
};
