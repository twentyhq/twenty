import { type LogicFunctionNewFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title, IconTool } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsLogicFunctionNewForm = ({
  formValues,
  onChange,
  readonly = false,
}: {
  formValues: LogicFunctionNewFormValues;
  onChange: <TKey extends keyof LogicFunctionNewFormValues>(
    key: TKey,
  ) => (value: LogicFunctionNewFormValues[TKey]) => void;
  readonly?: boolean;
}) => {
  const descriptionTextAreaId = `${formValues.name}-description`;
  const nameTextInputId = `${formValues.name}-name`;

  return (
    <Section>
      <H2Title
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
          value={formValues.description}
          onChange={onChange('description')}
          readOnly={readonly}
        />
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconTool}
            title={t`Available as tool`}
            description={t`When enabled, AI agents and workflow automations can discover and call this function`}
            checked={formValues.isTool}
            onChange={onChange('isTool')}
            disabled={readonly}
          />
        </Card>
      </StyledInputsContainer>
    </Section>
  );
};
