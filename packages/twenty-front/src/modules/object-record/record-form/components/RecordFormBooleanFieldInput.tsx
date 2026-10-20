import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Field, Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledBooleanInput = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${themeCssVariables.spacing['0.5']};
  height: 100%;
  padding: ${themeCssVariables.spacing['0.5']};
`;

const StyledBooleanInputOption = styled.span`
  align-items: center;
  border-radius: calc(
    ${themeCssVariables.border.radius.md} -
      ${themeCssVariables.spacing['0.5']} - 1px
  );
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

  const [initialValue] = useState(defaultValue);

  const instanceId = useId();
  const trueLabelId = `${instanceId}-true`;
  const falseLabelId = `${instanceId}-false`;

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={false}
        >
          <RadioGroup<boolean>
            defaultValue={initialValue}
            onValueChange={onChange}
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
