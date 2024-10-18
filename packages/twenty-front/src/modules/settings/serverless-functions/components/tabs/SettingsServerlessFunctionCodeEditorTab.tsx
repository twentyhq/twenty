import {
  File,
  SettingsServerlessFunctionCodeEditor,
} from '@/settings/serverless-functions/components/SettingsServerlessFunctionCodeEditor';
import { SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/settings/serverless-functions/constants/SettingsServerlessFunctionTabListComponentId';
import { SettingsServerlessFunctionHotkeyScope } from '@/settings/serverless-functions/types/SettingsServerlessFunctionHotKeyScope';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { CoreEditorHeader } from '@/ui/input/code-editor/components/CodeEditorHeader';
import { Section } from '@/ui/layout/section/components/Section';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { H2Title, IconGitCommit, IconPlayerPlay, IconRestore } from 'twenty-ui';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';

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
  const { activeTabIdState } = useTabList(
    SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID,
  );
  const activeTabId = useRecoilValue(activeTabIdState);
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
      tabListId={SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID}
      tabs={files.map((file) => {
        return { id: file.path, title: file.path.split('/').at(-1) || '' };
      })}
    />
  );

  const navigate = useNavigate();
  useHotkeyScopeOnMount(
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionEditorTab,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      navigate(getSettingsPagePath(SettingsPath.ServerlessFunctions));
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
