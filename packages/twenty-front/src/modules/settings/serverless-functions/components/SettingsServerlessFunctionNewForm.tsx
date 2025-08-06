import { ServerlessFunctionNewFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
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
}: {
  formValues: ServerlessFunctionNewFormValues;
  onChange: (key: string) => (value: string) => void;
}) => {
  const descriptionTextAreaId = `${formValues.name}-description`;
  const nameTextInputId = `${formValues.name}-name`;

  return (
    <Section>
      <H2Title title="About" description="Name and set your function" />
      <StyledInputsContainer>
        <SettingsTextInput
          instanceId={nameTextInputId}
          placeholder="Name"
          fullWidth
          autoFocusOnMount
          value={formValues.name}
          onChange={onChange('name')}
        />
        <TextArea
          textAreaId={descriptionTextAreaId}
          placeholder="Description"
          minRows={4}
          value={formValues.description}
          onChange={onChange('description')}
        />
      </StyledInputsContainer>
    </Section>
  );
};
