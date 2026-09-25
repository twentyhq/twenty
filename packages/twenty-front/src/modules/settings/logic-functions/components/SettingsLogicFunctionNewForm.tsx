import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components';
import { IconClockHour8 } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsLogicFunctionNewForm = ({
  formValues,
  onChange,
  readonly = false,
}: {
  formValues: LogicFunctionFormValues;
  onChange: <TKey extends keyof LogicFunctionFormValues>(
    key: TKey,
  ) => (value: LogicFunctionFormValues[TKey]) => void;
  readonly?: boolean;
}) => {
  const descriptionTextAreaId = `${formValues.name}-description`;
  const nameTextInputId = `${formValues.name}-name`;

  return (
    <Section.Root>
      <Section.Header
        title={t`About`}
        description={t`Name and describe your function`}
      />
      <StyledInputsContainer>
        <SettingsTextInput
          instanceId={nameTextInputId}
          placeholder={t`Name`}
          fullWidth
          autoFocusOnMount
          value={formValues.name}
          onChange={onChange('name')}
          readOnly={readonly}
        />
        <TextArea
          textAreaId={descriptionTextAreaId}
          placeholder={t`Description`}
          minRows={4}
          maxRows={5}
          value={formValues.description}
          onChange={onChange('description')}
          readOnly={readonly}
        />
        <Card rounded>
          <SettingsOptionCardContentCounter
            Icon={IconClockHour8}
            title={t`Timeout`}
            description={t`Maximum execution time in seconds (1-900)`}
            value={formValues.timeoutSeconds}
            onChange={onChange('timeoutSeconds')}
            minValue={1}
            maxValue={900}
            disabled={readonly}
          />
        </Card>
      </StyledInputsContainer>
    </Section.Root>
  );
};
