import { H2Title } from 'twenty-ui';
import { Section } from '@/ui/layout/section/components/Section';
import { TextInput } from '@/ui/input/components/TextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import { ServerlessFunctionFormValues } from '@/settings/serverless-functions/forms/useServerlessFunctionFormValues';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServerlessFunctionNewForm = ({
  formValues,
  onChange,
}: {
  formValues: ServerlessFunctionFormValues;
  onChange: (key: string) => (value: string | undefined) => void;
}) => {
  return (
    <Section>
      <H2Title title="About" description="Name and set your function" />
      <StyledInputsContainer>
        <TextInput
          placeholder="Name"
          fullWidth
          focused
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
