import {
  Button,
  CodeEditor,
  CoreEditorHeader,
  H2Title,
  IconPlayerPlay,
  Section,
} from 'twenty-ui';

import { SettingsServerlessFunctionHotkeyScope } from '@/settings/serverless-functions/types/SettingsServerlessFunctionHotKeyScope';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';
import { ServerlessFunctionExecutionResult } from '@/serverless-functions/components/ServerlessFunctionExecutionResult';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';

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
            withHeader
          />
        </StyledCodeEditorContainer>
        <ServerlessFunctionExecutionResult
          serverlessFunctionTestData={serverlessFunctionTestData}
        />
      </StyledInputsContainer>
    </Section>
  );
};
