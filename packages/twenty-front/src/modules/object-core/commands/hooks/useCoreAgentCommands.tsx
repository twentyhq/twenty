import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useContext } from 'react';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getSelectedRecordsCountLabel } from '@/command-menu-item/utils/getSelectedRecordsCountLabel';
import { CoreAgentAvatar } from '@/object-core/agents/components/CoreAgentAvatar';
import { CoreAgentsIcon } from '@/object-core/agents/components/CoreAgentsIcon';
import { useCoreAgentDetailView } from '@/object-core/agents/hooks/useCoreAgentDetailView';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { coreAgentCreationPendingFamilyState } from '@/object-core/agents/states/coreAgentCreationPendingFamilyState';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { coreAgentsIsDeletingFamilyState } from '@/object-core/agents/states/coreAgentsIsDeletingFamilyState';
import { coreAgentsSelectionFamilyState } from '@/object-core/agents/states/coreAgentsSelectionFamilyState';
import { getSelectedCoreAgentIds } from '@/object-core/agents/utils/getSelectedCoreAgentIds';
import { isCoreAgentMatchingFilterSettings } from '@/object-core/agents/utils/isCoreAgentMatchingFilterSettings';
import { type CoreAgentCommand } from '@/object-core/commands/types/CoreAgentCommand';
import { type CoreAgentCommandOrigin } from '@/object-core/commands/types/CoreAgentCommandOrigin';
import { getCoreAgentCommandAvailability } from '@/object-core/commands/utils/getCoreAgentCommandAvailability';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useAtomValue } from 'jotai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  IconDeviceFloppy,
  IconFilter,
  IconPlus,
  IconSettings,
  IconTerminal,
  IconTrash,
  IconX,
} from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
import { normalizeSearchText } from 'twenty-ui/utilities';
import {
  FeatureFlagKey,
  FindManyAgentsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useCoreAgentCommands = (origin: CoreAgentCommandOrigin | null) => {
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const target = origin?.target;
  const agentId = target?.type === 'record' ? target.agentId : '';
  const tableId = target?.type === 'index' ? target.tableId : '';
  const theme = useTheme();
  const workspace = useAtomValue(currentWorkspaceState.atom);
  const permissionFlags = useAtomValue(permissionFlagMapSelector.atom);
  const search = useAtomValue(sidePanelSearchState.atom);
  const selection = useAtomValue(
    coreAgentsSelectionFamilyState.getAtom(tableId, null),
  );
  const filterSettings = useAtomValue(coreAgentsFilterSettingsState.atom);
  const isDeleting = useAtomValue(
    coreAgentsIsDeletingFamilyState.getAtom(tableId, null),
  );
  const isCreating = useAtomValue(
    coreAgentCreationPendingFamilyState.getAtom(
      `${origin?.workspaceId}:${origin?.userId}`,
      null,
    ),
  );
  const record = useCoreAgentEditStatus({ agentId });
  const view = useCoreAgentDetailView({ agentId });
  const canShowRuns = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { data } = useQuery(FindManyAgentsDocument, {
    skip: target?.type !== 'index',
    fetchPolicy: 'cache-and-network',
  });
  const selectedAgentIds = getSelectedCoreAgentIds({
    selection,
    filterSettings,
    coreAgents: (data?.findManyAgents ?? []).filter((agent) =>
      isCoreAgentMatchingFilterSettings({ agent, filterSettings }),
    ),
    workspaceCustomApplicationId: workspace?.workspaceCustomApplication?.id,
  });
  const availability = isDefined(target)
    ? getCoreAgentCommandAvailability({
        target,
        canManageAgents: permissionFlags[PermissionFlagType.AI_SETTINGS],
        isInPreviewMode,
        isCreating,
        selectedCount: selectedAgentIds.length,
        isDeleting,
        record,
        view,
        canShowRuns,
      })
    : null;
  const definitions: Omit<CoreAgentCommand, 'disabled'>[] = [
    {
      id: 'create',
      label: t`Create agent`,
      Icon: IconPlus,
      section: 'THIS_OBJECT',
    },
    {
      id: 'filter',
      label: t`Filter agents`,
      Icon: IconFilter,
      section: 'THIS_OBJECT',
    },
    {
      id: 'selection-runs',
      label: t`See runs`,
      Icon: IconTerminal,
      section: 'SELECTION',
    },
    {
      id: 'delete-selection',
      label: selectedAgentIds.length === 1 ? t`Delete agent` : t`Delete agents`,
      Icon: IconTrash,
      section: 'SELECTION',
    },
    {
      id: 'save',
      label: t`Save agent`,
      Icon: IconDeviceFloppy,
      section: 'THIS_OBJECT',
    },
    {
      id: 'cancel',
      label: t`Cancel changes`,
      Icon: IconX,
      section: 'THIS_OBJECT',
    },
    {
      id: 'delete',
      label: t`Delete agent`,
      Icon: IconTrash,
      section: 'THIS_OBJECT',
    },
    {
      id: 'runs',
      label: t`See runs`,
      Icon: IconTerminal,
      section: 'THIS_OBJECT',
    },
    {
      id: 'settings',
      label: t`See settings`,
      Icon: IconSettings,
      section: 'THIS_OBJECT',
    },
  ];
  const commands = definitions
    .filter(
      ({ id, label }) =>
        availability?.[id].visible &&
        normalizeSearchText(label).includes(normalizeSearchText(search.trim())),
    )
    .map((command) => ({
      ...command,
      disabled: availability?.[command.id].disabled ?? true,
    }));
  const agent = record.session?.agent;
  const objectContext =
    target?.type === 'index'
      ? { label: t`Agents`, icon: <CoreAgentsIcon size={theme.icon.size.md} /> }
      : isDefined(agent)
        ? {
            label: agent.label,
            icon: <CoreAgentAvatar agent={agent} size={theme.icon.size.md} />,
          }
        : undefined;
  const selectionContext =
    target?.type === 'index' && isNonEmptyArray(selectedAgentIds)
      ? {
          label: getSelectedRecordsCountLabel({
            objectMetadataItem: {
              labelSingular: t`Agent`,
              labelPlural: t`Agents`,
            },
            numberOfSelectedRecords: selectedAgentIds.length,
          }),
        }
      : undefined;
  return { commands, objectContext, selectionContext };
};
