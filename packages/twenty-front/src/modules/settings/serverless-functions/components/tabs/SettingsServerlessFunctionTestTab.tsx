import { H2Title } from 'twenty-ui';
import { Section } from '@/ui/layout/section/components/Section';
import {
  ServerlessFunctionFormValues,
  SetServerlessFunctionFormValues,
} from '@/settings/serverless-functions/forms/useServerlessFunctionFormValues';
import { CodeEditor } from '@/ui/input/code-editor/components/CodeEditor';
import styled from '@emotion/styled';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServerlessFunctionTestTab = ({
  formValues,
  setFormValues,
}: {
  formValues: ServerlessFunctionFormValues;
  setFormValues: SetServerlessFunctionFormValues;
}) => {
  return (
    <Section>
      <H2Title
        title="Test your function"
        description='Insert a JSON input, then press "Run" to test your function.'
      />
      <StyledInputsContainer>
        <CodeEditor
          value={formValues.input}
          height={200}
          onChange={(value) => {
            setFormValues((prevState) => ({
              ...prevState,
              input: value,
            }));
          }}
          defaultLanguage={'json'}
        />
        <CodeEditor
          value={formValues.output}
          height={300}
          onChange={(value) => {
            setFormValues((prevState) => ({
              ...prevState,
              output: value,
            }));
          }}
          defaultLanguage={'json'}
          options={{ readOnly: true, domReadOnly: true }}
        />
      </StyledInputsContainer>
    </Section>
  );
};
