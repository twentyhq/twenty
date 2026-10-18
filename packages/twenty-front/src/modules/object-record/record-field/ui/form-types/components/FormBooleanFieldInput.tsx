import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { Field, Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { isStandaloneVariableString } from 'twenty-shared/workflow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isBoolean } from '@sniptt/guards';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledBooleanInput = styled.div`
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
  border-radius: calc(${themeCssVariables.border.radius.md} - 3px);
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
    outline-offset: 0;
  }
`;

type FormBooleanFieldInputProps = {
  label?: string;
  defaultValue: boolean | string | undefined;
  onChange: (value: boolean | null | string) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormBooleanFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
}: FormBooleanFieldInputProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const instanceId = useId();
  const trueLabelId = `${instanceId}-true`;
  const falseLabelId = `${instanceId}-false`;

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: boolean | null;
      }
    | {
        type: 'variable';
        value: string;
      }
  >(
    isStandaloneVariableString(defaultValue)
      ? {
          type: 'variable',
          value: defaultValue,
        }
      : {
          type: 'static',
          value: isBoolean(defaultValue) ? defaultValue : null,
        },
  );

  const handleValueChange = (value: boolean | null) => {
    if (!isBoolean(value)) {
      return;
    }

    setDraftValue({
      type: 'static',
      value,
    });

    onChange(value);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    onChange(variableName);
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: false,
    });

    onChange(false);
  };

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            <RadioGroup<boolean | null>
              value={draftValue.value}
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
          ) : (
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInnerContainer>

        {isDefined(VariablePicker) && !readonly && (
          <VariablePicker
            instanceId={instanceId}
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
