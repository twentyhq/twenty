import {
  type File,
  SettingsLogicFunctionCodeEditor,
} from '@/settings/logic-functions/components/SettingsLogicFunctionCodeEditor';
import { SETTINGS_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/settings/logic-functions/constants/SettingsLogicFunctionTabListComponentId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title, IconPlayerPlay } from 'twenty-ui/display';
import { Button, CoreEditorHeader } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledTabList = styled(TabList)`
  border-bottom: none;
`;

export const SettingsLogicFunctionCodeEditorTab = ({
  files,
  handleExecute,
  onChange,
  isTesting = false,
}: {
  files: File[];
  handleExecute: () => void;
  onChange: (value: string) => void;
  isTesting?: boolean;
}) => {
  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    SETTINGS_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID,
  );
  const TestButton = (
    <Button
      title={t`Test`}
      variant="primary"
      accent="blue"
      size="small"
      Icon={IconPlayerPlay}
      disabled={isTesting}
      onClick={handleExecute}
    />
  );

  const HeaderTabList = (
    <StyledTabList
      tabs={files.map((file) => {
        return { id: file.path, title: file.path.split('/').at(-1) || '' };
      })}
      componentInstanceId={SETTINGS_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID}
    />
  );

  return (
    <Section>
      <H2Title
        title={t`Code your function`}
        description={t`Write your function (in typescript) below`}
      />
      <CoreEditorHeader leftNodes={[HeaderTabList]} rightNodes={[TestButton]} />
      {activeTabId && (
        <SettingsLogicFunctionCodeEditor
          files={files}
          currentFilePath={activeTabId}
          onChange={(newCodeValue: string) => onChange(newCodeValue)}
        />
      )}
    </Section>
  );
};
