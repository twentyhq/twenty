import { H2Title, IconPlayerPlay } from 'twenty-ui';
import { Section } from '@/ui/layout/section/components/Section';
import {
  ServerlessFunctionFormValues,
  SetServerlessFunctionFormValues,
} from '@/settings/serverless-functions/forms/useServerlessFunctionFormValues';
import { CodeEditor } from '@/ui/input/code-editor/components/CodeEditor';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { CoreEditorHeader } from '@/ui/input/code-editor/components/CodeEditorHeader';
import { Button } from '@/ui/input/button/components/Button';
import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServerlessFunctionTestTab = ({
  formValues,
  setFormValues,
  handleExecute,
}: {
  formValues: ServerlessFunctionFormValues;
  setFormValues: SetServerlessFunctionFormValues;
  handleExecute: () => void;
}) => {
  const [language, setLanguage] = useState('plaintext');
  const [resultHeight, setResultHeight] = useState(64);

  const InputHeaderButton = (
    <Button
      title="Run Function"
      variant="primary"
      accent="blue"
      size="small"
      Icon={IconPlayerPlay}
      onClick={handleExecute}
    />
  );

  const InputHeader = (
    <CoreEditorHeader title={'Input'} rightNodes={[InputHeaderButton]} />
  );

  const OutputHeaderButton = (
    <LightCopyIconButton copyText={formValues.output || ''} />
  );

  const OutputHeader = (
    <CoreEditorHeader title={'Output'} rightNodes={[OutputHeaderButton]} />
  );

  useEffect(() => {
    try {
      JSON.parse(formValues.output || '');
      setLanguage('json');
      setResultHeight(300);
    } catch {
      setLanguage('plaintext');
      setResultHeight(64);
    }
  }, [formValues.output]);

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
          language={'json'}
          header={InputHeader}
        />
        <CodeEditor
          value={formValues.output}
          height={resultHeight}
          onChange={(value) => {
            setFormValues((prevState) => ({
              ...prevState,
              output: value,
            }));
          }}
          language={language}
          options={{ readOnly: true, domReadOnly: true }}
          header={OutputHeader}
        />
      </StyledInputsContainer>
    </Section>
  );
};
