import { ServerlessFunctionNewFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { H2Title, Section } from 'twenty-ui';

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
  return (
    <Section>
      <H2Title title="About" description="Name and set your function" />
      <StyledInputsContainer>
        <TextInput
          placeholder="Name"
          fullWidth
          autoFocusOnMount
          value={formValues.name}
          onChange={onChange('name')}
        />
        <TextArea
          placeholder="Description"
          minRows={4}
          value={formValues.description}
          onChange={onChange('description')}
        />
      </StyledInputsContainer>
    </Section>
  );
};
