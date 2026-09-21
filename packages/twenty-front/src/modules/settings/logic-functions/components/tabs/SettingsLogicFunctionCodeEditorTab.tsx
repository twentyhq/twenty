import {
  type File,
  SettingsLogicFunctionCodeEditor,
} from '@/settings/logic-functions/components/SettingsLogicFunctionCodeEditor';
import { SETTINGS_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/settings/logic-functions/constants/SettingsLogicFunctionTabListComponentId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components';
import { CodeEditorHeader } from 'twenty-ui/components/code-editor';
import { IconPlayerPlay } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

const StyledTabListContainer = styled.div`
  > * {
    border-bottom: none;
  }
`;

export const SettingsLogicFunctionCodeEditorTab = ({
  files,
  handleExecute,
  onChange,
  isTesting = false,
  applicationVariableKeys,
}: {
  files: File[];
  handleExecute: () => void;
  onChange: (value: string) => void;
  isTesting?: boolean;
  applicationVariableKeys?: string[];
}) => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID,
  );
  const TestButton = (
    <Button
      size="sm"
      startIcon={<IconPlayerPlay />}
      disabled={isTesting}
      onClick={handleExecute}
      variant="solid"
      color="accent"
    >{t`Test`}</Button>
  );

  const HeaderTabList = (
    <StyledTabListContainer>
      <TabList
        aria-label={t`Function files`}
        tabs={files.map((file) => {
          return { id: file.path, title: file.path.split('/').at(-1) || '' };
        })}
        componentInstanceId={SETTINGS_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID}
      />
    </StyledTabListContainer>
  );

  return (
    <Section.Root>
      <Section.Header
        title={t`Code your function`}
        description={t`Write your function (in typescript) below`}
      />
      <CodeEditorHeader leftNodes={[HeaderTabList]} rightNodes={[TestButton]} />
      {activeTabId && (
        <SettingsLogicFunctionCodeEditor
          files={files}
          currentFilePath={activeTabId}
          onChange={(newCodeValue: string) => onChange(newCodeValue)}
          applicationVariableKeys={applicationVariableKeys}
        />
      )}
    </Section.Root>
  );
};
