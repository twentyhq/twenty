import {
  type File,
  SettingsServerlessFunctionCodeEditor,
} from '@/settings/serverless-functions/components/SettingsServerlessFunctionCodeEditor';
import { SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/settings/serverless-functions/constants/SettingsServerlessFunctionTabListComponentId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title, IconPlayerPlay } from 'twenty-ui/display';
import { Button, CoreEditorHeader } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledTabList = styled(TabList)`
  border-bottom: none;
`;

export const SettingsServerlessFunctionCodeEditorTab = ({
  files,
  handleExecute,
  onChange,
  isTesting = false,
  isManaged = false,
}: {
  files: File[];
  handleExecute: () => void;
  onChange: (filePath: string, value: string) => void;
  isTesting?: boolean;
  isManaged?: boolean;
}) => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID,
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
      componentInstanceId={SETTINGS_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID}
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
        <SettingsServerlessFunctionCodeEditor
          files={files}
          currentFilePath={activeTabId}
          onChange={(newCodeValue) => onChange(activeTabId, newCodeValue)}
          options={
            isManaged
              ? {
                  readOnly: true,
                  readOnlyMessage: {
                    value: t`Managed serverless functions are not editable`,
                  },
                }
              : undefined
          }
        />
      )}
    </Section>
  );
};
