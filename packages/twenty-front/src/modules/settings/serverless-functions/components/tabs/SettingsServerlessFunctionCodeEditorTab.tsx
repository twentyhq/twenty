import {
  File,
  SettingsServerlessFunctionCodeEditor,
} from '@/settings/serverless-functions/components/SettingsServerlessFunctionCodeEditor';
import { SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/settings/serverless-functions/constants/SettingsServerlessFunctionTabListComponentId';
import { SettingsServerlessFunctionHotkeyScope } from '@/settings/serverless-functions/types/SettingsServerlessFunctionHotKeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';
import {
  Button,
  CoreEditorHeader,
  H2Title,
  IconGitCommit,
  IconPlayerPlay,
  IconRestore,
  Section,
} from 'twenty-ui';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledTabList = styled(TabList)`
  border-bottom: none;
`;

export const SettingsServerlessFunctionCodeEditorTab = ({
  files,
  handleExecute,
  handlePublish,
  handleReset,
  resetDisabled,
  publishDisabled,
  onChange,
  setIsCodeValid,
}: {
  files: File[];
  handleExecute: () => void;
  handlePublish: () => void;
  handleReset: () => void;
  resetDisabled: boolean;
  publishDisabled: boolean;
  onChange: (filePath: string, value: string) => void;
  setIsCodeValid: (isCodeValid: boolean) => void;
}) => {
  const { activeTabId } = useTabList(
    SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID,
  );
  const TestButton = (
    <Button
      title="Test"
      variant="primary"
      accent="blue"
      size="small"
      Icon={IconPlayerPlay}
      onClick={handleExecute}
    />
  );
  const PublishButton = (
    <Button
      title="Publish"
      variant="secondary"
      size="small"
      Icon={IconGitCommit}
      onClick={handlePublish}
      disabled={publishDisabled}
    />
  );
  const ResetButton = (
    <Button
      title="Reset"
      variant="secondary"
      size="small"
      Icon={IconRestore}
      onClick={handleReset}
      disabled={resetDisabled}
    />
  );

  const HeaderTabList = (
    <StyledTabList
      tabListInstanceId={SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID}
      tabs={files
        .filter((file) => file.path !== '.env')
        .map((file) => {
          return { id: file.path, title: file.path.split('/').at(-1) || '' };
        })}
    />
  );

  const navigate = useNavigateSettings();
  useHotkeyScopeOnMount(
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionEditorTab,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      navigate(SettingsPath.ServerlessFunctions);
    },
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionEditorTab,
  );

  return (
    <Section>
      <H2Title
        title="Code your function"
        description="Write your function (in typescript) below"
      />
      <CoreEditorHeader
        leftNodes={[HeaderTabList]}
        rightNodes={[ResetButton, PublishButton, TestButton]}
      />
      {activeTabId && (
        <SettingsServerlessFunctionCodeEditor
          files={files}
          currentFilePath={activeTabId}
          onChange={(newCodeValue) => onChange(activeTabId, newCodeValue)}
          setIsCodeValid={setIsCodeValid}
        />
      )}
    </Section>
  );
};
