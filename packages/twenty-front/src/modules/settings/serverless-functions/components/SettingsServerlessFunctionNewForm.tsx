import { type ServerlessFunctionNewFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServerlessFunctionNewForm = ({
  formValues,
  onChange,
  readonly = false,
}: {
  formValues: ServerlessFunctionNewFormValues;
  onChange: (key: string) => (value: string) => void;
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
      </StyledInputsContainer>
    </Section>
  );
};
