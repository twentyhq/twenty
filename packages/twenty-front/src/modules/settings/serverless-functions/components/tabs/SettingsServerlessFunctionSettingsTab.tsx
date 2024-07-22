import { H2Title } from 'twenty-ui';
import { Section } from '@/ui/layout/section/components/Section';
import { TextInput } from '@/ui/input/components/TextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import {
  ServerlessFunctionFormValues,
  SetServerlessFunctionFormValues,
} from '@/settings/serverless-functions/forms/useServerlessFunctionFormValues';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServerlessFunctionSettingsTab = ({
  formValues,
  setFormValues,
}: {
  formValues: ServerlessFunctionFormValues;
  setFormValues: SetServerlessFunctionFormValues;
}) => {
  return (
    <Section>
      <H2Title title="About" description="Name and set your function" />
      <StyledInputsContainer>
        <TextInput
          placeholder="Name"
          fullWidth
          value={formValues.name}
          onChange={(value) => {
            setFormValues((prevState) => ({
              ...prevState,
              name: value,
            }));
          }}
        />
        <TextArea
          placeholder="Description"
          minRows={4}
          value={formValues.description}
          onChange={(value) => {
            setFormValues((prevState) => ({
              ...prevState,
              description: value,
            }));
          }}
        />
      </StyledInputsContainer>
    </Section>
  );
};
