import { t } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconLego } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { CORE_AGENT_TABLE_COLUMNS } from '@/object-core/agents/constants/CoreAgentTableColumns';
import {
  CORE_AGENTS_INITIAL_SORT,
  CORE_AGENTS_TABLE_ID,
  useCoreAgents,
} from '@/object-core/agents/hooks/useCoreAgents';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { CoreObjectIndexPageLayout } from '@/object-core/components/CoreObjectIndexPageLayout';
import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { CoreObjectTableAddNewRow } from '@/object-core/components/CoreObjectTableAddNewRow';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const getCoreAgentLink = (agent: CoreAgent) =>
  getAppPath(AppPath.AgentShowPage, { agentId: agent.id });

export const AgentCoreIndexPage = () => {
  const theme = useTheme();
  const navigateSettings = useNavigateSettings();

  const tableId =
    useWorkspaceSurfaceScopedComponentInstanceId(CORE_AGENTS_TABLE_ID);

  const { coreAgents, isInitialLoading, error } = useCoreAgents({ tableId });

  const canCreateAgent = useHasPermissionFlag(PermissionFlagType.AI_SETTINGS);

  const createAgent = () => navigateSettings(SettingsPath.AiNewAgent);

  const hasError = isDefined(error);

  const isEmpty = !isInitialLoading && !hasError && coreAgents.length === 0;

  return (
    <CoreObjectIndexPageLayout
      labelPlural={t`Agents`}
      icon={
        <IconLego size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      }
      actionButton={<SidePanelToggleButton />}
      isInitialLoading={isInitialLoading}
      hasError={hasError}
      isEmpty={isEmpty}
      emptyState={{
        title: t`Add your first Agent`,
        subTitle: t`Create an Agent to automate your work.`,
        buttonTitle: t`Add an Agent`,
        onButtonClick: canCreateAgent ? createAgent : undefined,
      }}
    >
      <CoreObjectTable
        tableId={tableId}
        columns={CORE_AGENT_TABLE_COLUMNS}
        items={coreAgents}
        getItemKey={(agent) => agent.id}
        getItemLink={getCoreAgentLink}
        initialSort={CORE_AGENTS_INITIAL_SORT}
      />
      {canCreateAgent && (
        <CoreObjectTableAddNewRow label={t`New Agent`} onClick={createAgent} />
      )}
    </CoreObjectIndexPageLayout>
  );
};
