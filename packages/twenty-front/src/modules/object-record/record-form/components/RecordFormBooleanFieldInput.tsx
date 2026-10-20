import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SegmentedControl } from 'twenty-ui/components/input';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFormFieldInputInnerContainer = styled(FormFieldInputInnerContainer)`
  & > [role='radiogroup'] {
    width: 100%;
  }

  & > [role='radiogroup']:has(:focus-visible) {
    border-color: ${themeCssVariables.color.blue};
  }

  & [role='radio']:focus-visible {
    outline: none;
  }

  & [role='radio']:focus-visible:not([data-checked]) {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

type RecordFormBooleanFieldInputProps = {
  label?: string;
  defaultValue?: boolean;
  onChange: (value: boolean) => void;
  readonly?: boolean;
};

export const RecordFormBooleanFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
}: RecordFormBooleanFieldInputProps) => {
  const { t } = useLingui();

  const [initialValue] = useState(defaultValue);

  const instanceId = useId();

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer>
        <StyledFormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={false}
          variant="transparent"
        >
          <SegmentedControl
            variant="rectangle"
            aria-label={isNonEmptyString(label) ? label : t`True or false`}
            options={[
              { value: 'true', label: t`True`, startIcon: <IconCheck /> },
              { value: 'false', label: t`False`, startIcon: <IconX /> },
            ]}
            defaultValue={
              isDefined(initialValue) ? String(initialValue) : undefined
            }
            onValueChange={(value) => onChange(value === 'true')}
            disabled={readonly}
          />
        </StyledFormFieldInputInnerContainer>
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
