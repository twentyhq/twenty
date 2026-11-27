import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useQuery } from '@apollo/client/react';

import { useCanTestCoreAgent } from '@/object-core/agents/hooks/useCanTestCoreAgent';
import { useSelectedCoreAgentIds } from '@/object-core/agents/hooks/useSelectedCoreAgentIds';
import { CORE_AGENT_TEST_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentTestCommandId';
import { CORE_AGENTS_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsDeleteCommandId';
import { CORE_AGENTS_SEE_TURNS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsSeeTurnsCommandId';
import { isMatchingSidePanelSearch } from '@/object-core/commands/utils/isMatchingSidePanelSearch';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  FindManyAgentsDocument,
} from '~/generated-metadata/graphql';

export const useCoreAgentsSelectionCommands = () => {
  const { t } = useLingui();
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const canManageCoreAgents = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const selectedCoreAgentIds = useSelectedCoreAgentIds();

  // the index already loaded its agents, and nothing is selected anywhere else
  const { data } = useQuery(FindManyAgentsDocument, {
    fetchPolicy: 'cache-only',
    skip: selectedCoreAgentIds.length !== 1,
  });
  const canTestSelectedCoreAgent = useCanTestCoreAgent(
    data?.findManyAgents.find(({ id }) => id === selectedCoreAgentIds[0]),
  );

  const testCommandLabel = t`Test Agent`;
  const shouldDisplayTestCommand =
    selectedCoreAgentIds.length === 1 &&
    canTestSelectedCoreAgent &&
    !isInPreviewMode &&
    isMatchingSidePanelSearch({ label: testCommandLabel, sidePanelSearch });

  const seeTurnsCommandLabel = t`See Turns`;
  const shouldDisplaySeeTurnsCommand =
    selectedCoreAgentIds.length === 1 &&
    isAiChatInboxEnabled &&
    !isInPreviewMode &&
    isMatchingSidePanelSearch({ label: seeTurnsCommandLabel, sidePanelSearch });

  const deleteCommandLabel =
    selectedCoreAgentIds.length === 1 ? t`Delete Agent` : t`Delete Agents`;
  const shouldDisplayDeleteCommand =
    isNonEmptyArray(selectedCoreAgentIds) &&
    !isInPreviewMode &&
    canManageCoreAgents &&
    isMatchingSidePanelSearch({ label: deleteCommandLabel, sidePanelSearch });

  return {
    selectedCoreAgentIds,
    testCommandLabel,
    shouldDisplayTestCommand,
    seeTurnsCommandLabel,
    shouldDisplaySeeTurnsCommand,
    deleteCommandLabel,
    shouldDisplayDeleteCommand,
    coreAgentsSelectionCommandIds: [
      ...(shouldDisplayTestCommand ? [CORE_AGENT_TEST_COMMAND_ID] : []),
      ...(shouldDisplaySeeTurnsCommand
        ? [CORE_AGENTS_SEE_TURNS_COMMAND_ID]
        : []),
      ...(shouldDisplayDeleteCommand ? [CORE_AGENTS_DELETE_COMMAND_ID] : []),
    ],
  };
};
