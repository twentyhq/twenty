import { Section } from '@/ui/layout/section/components/Section';
import { H2Title, IconPlayerPlay } from 'twenty-ui';

import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { SettingsServerlessFunctionsOutputMetadataInfo } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsOutputMetadataInfo';
import { settingsServerlessFunctionCodeEditorOutputParamsState } from '@/settings/serverless-functions/states/settingsServerlessFunctionCodeEditorOutputParamsState';
import { settingsServerlessFunctionInputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionInputState';
import { settingsServerlessFunctionOutputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionOutputState';
import { SettingsServerlessFunctionHotkeyScope } from '@/settings/serverless-functions/types/SettingsServerlessFunctionHotKeyScope';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { CodeEditor } from '@/ui/input/code-editor/components/CodeEditor';
import { CoreEditorHeader } from '@/ui/input/code-editor/components/CodeEditorHeader';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';

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

  const navigate = useNavigate();
  useHotkeyScopeOnMount(
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionTestTab,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      navigate(getSettingsPagePath(SettingsPath.ServerlessFunctions));
    },
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionTestTab,
  );

  return (
    <Section>
      <H2Title
        title="Test your function"
        description='Insert a JSON input, then press "Run" to test your function.'
      />
      <StyledInputsContainer>
        <div>
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
            files={[
              {
                content: settingsServerlessFunctionInput,
                language: 'json',
                path: 'input.json',
              },
            ]}
            currentFilePath={'input.json'}
            height={200}
            onChange={setSettingsServerlessFunctionInput}
          />
        </div>
        <div>
          <CoreEditorHeader
            leftNodes={[<SettingsServerlessFunctionsOutputMetadataInfo />]}
            rightNodes={[<LightCopyIconButton copyText={result} />]}
          />
          <CodeEditor
            files={[
              {
                content: result,
                language:
                  settingsServerlessFunctionCodeEditorOutputParams.language,
                path: 'result.any',
              },
            ]}
            currentFilePath={'result.any'}
            height={settingsServerlessFunctionCodeEditorOutputParams.height}
            options={{ readOnly: true, domReadOnly: true }}
          />
        </div>
      </StyledInputsContainer>
    </Section>
  );
};
