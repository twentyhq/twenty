import { ServerlessFunctionExecutionResult } from '@/serverless-functions/components/ServerlessFunctionExecutionResult';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { H2Title, IconPlayerPlay } from 'twenty-ui/display';
import { Button, CodeEditor, CoreEditorHeader } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SettingsServerlessFunctionTestTab = ({
  handleExecute,
  serverlessFunctionId,
}: {
  handleExecute: () => void;
  serverlessFunctionId: string;
}) => {
  const [serverlessFunctionTestData, setServerlessFunctionTestData] =
    useRecoilState(serverlessFunctionTestDataFamilyState(serverlessFunctionId));

  const onChange = (newInput: string) => {
    setServerlessFunctionTestData((prev) => ({
      ...prev,
      input: JSON.parse(newInput),
    }));
  };

  return (
    <Section>
      <H2Title
        title="Test your function"
        description='Insert a JSON input, then press "Run" to test your function.'
      />
      <StyledInputsContainer>
        <StyledCodeEditorContainer>
          <CoreEditorHeader
            title={'Input'}
            rightNodes={[
              <Button
                title="Run Function"
                variant="primary"
                accent="blue"
                size="small"
                Icon={IconPlayerPlay}
                onClick={handleExecute}
              />,
            ]}
          />
          <CodeEditor
            value={JSON.stringify(serverlessFunctionTestData.input, null, 4)}
            language="json"
            height={200}
            onChange={onChange}
            variant="with-header"
          />
        </StyledCodeEditorContainer>
        <ServerlessFunctionExecutionResult
          serverlessFunctionTestData={serverlessFunctionTestData}
        />
      </StyledInputsContainer>
    </Section>
  );
};
