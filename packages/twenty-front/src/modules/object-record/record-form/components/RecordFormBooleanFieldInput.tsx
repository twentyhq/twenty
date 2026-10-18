import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isBoolean, isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Field, Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledBooleanInput = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: 2px;
  height: 100%;
  padding: 2px;
`;

const StyledBooleanInputOption = styled.span`
  align-items: center;
  border-radius: calc(${themeCssVariables.border.radius.sm} - 3px);
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex: 1 1 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  min-width: 0;
  user-select: none;

  &:hover:not([data-checked]):not([data-disabled]) {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }

  &[data-checked] {
    background-color: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.primary};
  }

  &[data-disabled] {
    color: ${themeCssVariables.font.color.tertiary};
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 1px;
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
  const theme = useTheme();
  const instanceId = useId();
  const trueLabelId = `${instanceId}-true`;
  const falseLabelId = `${instanceId}-false`;

  const handleValueChange = (value: boolean | null) => {
    if (isBoolean(value)) {
      onChange(value);
    }
  };

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={false}
          variant="transparent"
        >
          <RadioGroup<boolean | null>
            value={defaultValue ?? null}
            onValueChange={handleValueChange}
            disabled={readonly}
            render={<StyledBooleanInput />}
          >
            <Radio.Root
              value={true}
              aria-labelledby={trueLabelId}
              render={<StyledBooleanInputOption />}
            >
              <IconCheck size={theme.icon.size.md} />
              <span id={trueLabelId}>{t`True`}</span>
            </Radio.Root>
            <Radio.Root
              value={false}
              aria-labelledby={falseLabelId}
              render={<StyledBooleanInputOption />}
            >
              <IconX size={theme.icon.size.md} />
              <span id={falseLabelId}>{t`False`}</span>
            </Radio.Root>
          </RadioGroup>
        </FormFieldInputInnerContainer>
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
