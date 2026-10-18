import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SegmentedControl } from 'twenty-ui/components/input';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Field } from 'twenty-ui/primitives/input';

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
  const instanceId = useId();

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={false}
          variant="transparent"
        >
          <SegmentedControl<'true' | 'false' | ''>
            aria-label={isNonEmptyString(label) ? label : t`Boolean value`}
            shape="square"
            fullWidth
            value={isDefined(defaultValue) ? `${defaultValue}` : ''}
            onValueChange={(value) => onChange(value === 'true')}
            disabled={readonly}
            options={[
              { value: 'true', label: t`Yes`, startIcon: <IconCheck /> },
              { value: 'false', label: t`No`, startIcon: <IconX /> },
            ]}
          />
        </FormFieldInputInnerContainer>
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
