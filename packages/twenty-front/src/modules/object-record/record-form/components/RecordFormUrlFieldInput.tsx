import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RecordFormTextInput } from '@/object-record/record-form/components/RecordFormTextInput';
import { splitUrlProtocol } from '@/object-record/record-form/utils/splitUrlProtocol';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

type RecordFormUrlFieldInputProps = {
  label?: string;
  defaultValue?: FieldLinksValue;
  onChange: (value: FieldLinksValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormUrlFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: RecordFormUrlFieldInputProps) => {
  const [lastTypedProtocol, setLastTypedProtocol] = useState(
    doNotTranslate('https://'),
  );

  const { protocol: savedProtocol, urlWithoutProtocol } = splitUrlProtocol(
    defaultValue?.primaryLinkUrl ?? '',
  );
  const protocol = savedProtocol ?? lastTypedProtocol;

  const handleChange = (newText: string) => {
    const {
      protocol: typedProtocol,
      urlWithoutProtocol: newUrlWithoutProtocol,
    } = splitUrlProtocol(newText.trim());

    if (isDefined(typedProtocol)) {
      setLastTypedProtocol(typedProtocol);
    }

    onChange({
      primaryLinkLabel: defaultValue?.primaryLinkLabel ?? '',
      primaryLinkUrl: isNonEmptyString(newUrlWithoutProtocol)
        ? `${typedProtocol ?? protocol}${newUrlWithoutProtocol}`
        : '',
      secondaryLinks: defaultValue?.secondaryLinks ?? null,
    });
  };

  return (
    <RecordFormTextInput
      label={label}
      value={urlWithoutProtocol}
      onChange={handleChange}
      readonly={readonly}
      placeholder={
        isNonEmptyString(placeholder)
          ? splitUrlProtocol(placeholder).urlWithoutProtocol
          : t`URL`
      }
      prefix={protocol}
    />
  );
};
