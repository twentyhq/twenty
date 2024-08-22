import { ServerlessFunctionFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { SettingsServerlessFunctionHotkeyScope } from '@/settings/serverless-functions/types/SettingsServerlessFunctionHotKeyScope';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { CodeEditor } from '@/ui/input/code-editor/components/CodeEditor';
import { CoreEditorHeader } from '@/ui/input/code-editor/components/CodeEditorHeader';
import { Section } from '@/ui/layout/section/components/Section';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { Key } from 'ts-key-enum';
import { H2Title, IconPlayerPlay } from 'twenty-ui';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';

const StyledTabList = styled(TabList)`
  border-bottom: none;
`;

export const SettingsServerlessFunctionCodeEditorTab = ({
  formValues,
  handleExecute,
  onChange,
}: {
  formValues: ServerlessFunctionFormValues;
  handleExecute: () => void;
  onChange: (key: string) => (value: string) => void;
}) => {
  const HeaderButton = (
    <Button
      title="Test"
      variant="primary"
      accent="blue"
      size="small"
      Icon={IconPlayerPlay}
      onClick={handleExecute}
    />
  );

  const TAB_LIST_COMPONENT_ID = 'serverless-function-editor';

  const HeaderTabList = (
    <StyledTabList
      tabListId={TAB_LIST_COMPONENT_ID}
      tabs={[{ id: 'index.ts', title: 'index.ts' }]}
    />
  );

  const Header = (
    <CoreEditorHeader leftNodes={[HeaderTabList]} rightNodes={[HeaderButton]} />
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
      <CodeEditor
        value={formValues.code}
        onChange={onChange('code')}
        header={Header}
      />
    </Section>
  );
};
