import { H2Title, IconPlayerPlay } from 'twenty-ui';
import { Section } from '@/ui/layout/section/components/Section';

import { CodeEditor } from '@/ui/input/code-editor/components/CodeEditor';
import styled from '@emotion/styled';
import { CoreEditorHeader } from '@/ui/input/code-editor/components/CodeEditorHeader';
import { Button } from '@/ui/input/button/components/Button';
import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { useRecoilState, useRecoilValue } from 'recoil';
import { settingsServerlessFunctionOutputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionOutputState';
import { settingsServerlessFunctionInputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionInputState';
import { settingsServerlessFunctionCodeEditorOutputParamsState } from '@/settings/serverless-functions/states/settingsServerlessFunctionCodeEditorOutputParamsState';
import { SettingsServerlessFunctionsOutputMetadataInfo } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsOutputMetadataInfo';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServerlessFunctionTestTab = ({
  handleExecute,
}: {
  handleExecute: () => void;
}) => {
  const settingsServerlessFunctionCodeEditorOutputParams = useRecoilValue(
    settingsServerlessFunctionCodeEditorOutputParamsState,
  );
  const settingsServerlessFunctionOutput = useRecoilValue(
    settingsServerlessFunctionOutputState,
  );
  const [settingsServerlessFunctionInput, setSettingsServerlessFunctionInput] =
    useRecoilState(settingsServerlessFunctionInputState);

  const result =
    settingsServerlessFunctionOutput.data ||
    settingsServerlessFunctionOutput.error ||
    '';

  const InputHeader = (
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
  );

  const OutputHeader = (
    <CoreEditorHeader
      leftNodes={[<SettingsServerlessFunctionsOutputMetadataInfo />]}
      rightNodes={[<LightCopyIconButton copyText={result} />]}
    />
  );

  return (
    <Section>
      <H2Title
        title="Test your function"
        description='Insert a JSON input, then press "Run" to test your function.'
      />
      <StyledInputsContainer>
        <CodeEditor
          value={settingsServerlessFunctionInput}
          height={200}
          onChange={setSettingsServerlessFunctionInput}
          language={'json'}
          header={InputHeader}
        />
        <CodeEditor
          value={result}
          height={settingsServerlessFunctionCodeEditorOutputParams.height}
          language={settingsServerlessFunctionCodeEditorOutputParams.language}
          options={{ readOnly: true, domReadOnly: true }}
          header={OutputHeader}
        />
      </StyledInputsContainer>
    </Section>
  );
};
