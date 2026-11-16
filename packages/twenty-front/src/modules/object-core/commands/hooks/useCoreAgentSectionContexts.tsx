import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';
import { getSelectedRecordsCountLabel } from '@/command-menu-item/utils/getSelectedRecordsCountLabel';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { useCurrentCoreAgent } from '@/object-core/agents/hooks/useCurrentCoreAgent';
import { useIsCoreAgentsIndexPage } from '@/object-core/agents/hooks/useIsCoreAgentsIndexPage';
import { useSelectedCoreAgentIds } from '@/object-core/agents/hooks/useSelectedCoreAgentIds';

export const useCoreAgentSectionContexts = () => {
  const { t } = useLingui();
  const isCoreAgentsIndexPage = useIsCoreAgentsIndexPage();
  const currentCoreAgent = useCurrentCoreAgent();
  const selectedCoreAgentIds = useSelectedCoreAgentIds();

  const coreAgentsObjectSectionContext:
    | CommandMenuItemSectionContext
    | undefined = isCoreAgentsIndexPage
    ? {
        icon: <CoreAgentIcon size={16} />,
        label: t`Agents`,
      }
    : undefined;

  const getCoreAgentSelectionSectionContext = ():
    | CommandMenuItemSectionContext
    | undefined => {
    if (isDefined(currentCoreAgent)) {
      return {
        icon: (
          <CoreAgentIcon
            agentId={currentCoreAgent.id}
            avatarColor={currentCoreAgent.avatarColor}
            avatarShape={currentCoreAgent.avatarShape}
            size={16}
          />
        ),
        label: isNonEmptyString(currentCoreAgent.label)
          ? currentCoreAgent.label
          : t`Untitled`,
      };
    }

    if (isNonEmptyArray(selectedCoreAgentIds)) {
      return {
        label: getSelectedRecordsCountLabel({
          objectMetadataItem: {
            labelSingular: t`Agent`,
            labelPlural: t`Agents`,
          },
          numberOfSelectedRecords: selectedCoreAgentIds.length,
        }),
      };
    }

    return undefined;
  };

  return {
    coreAgentsObjectSectionContext,
    coreAgentSelectionSectionContext: getCoreAgentSelectionSectionContext(),
  };
};
