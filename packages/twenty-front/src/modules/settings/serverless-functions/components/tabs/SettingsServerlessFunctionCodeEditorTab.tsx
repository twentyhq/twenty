import {
  File,
  SettingsServerlessFunctionCodeEditor,
} from '@/settings/serverless-functions/components/SettingsServerlessFunctionCodeEditor';
import { SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/settings/serverless-functions/constants/SettingsServerlessFunctionTabListComponentId';
import { SettingsServerlessFunctionHotkeyScope } from '@/settings/serverless-functions/types/SettingsServerlessFunctionHotKeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { Button, CoreEditorHeader } from 'twenty-ui/input';
import {
  H2Title,
  IconGitCommit,
  IconPlayerPlay,
  IconRestore,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

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
  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
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
      tabs={files
        .filter((file) => file.path !== '.env')
        .map((file) => {
          return { id: file.path, title: file.path.split('/').at(-1) || '' };
        })}
      componentInstanceId={SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID}
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
