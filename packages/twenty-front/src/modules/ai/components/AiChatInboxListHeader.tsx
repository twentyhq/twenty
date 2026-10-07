import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatInboxLayoutDropdown } from '@/ai/components/AiChatInboxLayoutDropdown';
import { AiChatInboxTriageCommandMenuItems } from '@/ai/components/AiChatInboxTriageCommandMenuItems';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { useIsAiChatInboxSplitView } from '@/ai/hooks/useIsAiChatInboxSplitView';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { RecordIndexPageHeaderTitle } from '@/object-record/record-index/components/RecordIndexPageHeaderTitle';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatInboxListHeaderProps = {
  selectedThreadCount: number;
};

export const AiChatInboxListHeader = ({
  selectedThreadCount,
}: AiChatInboxListHeaderProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const FilterStatusIcon =
    AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus];
  const isMobile = useIsMobile();
  const isSplitView = useIsAiChatInboxSplitView();
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });

  return (
    <PageCardHeader
      icon={<FilterStatusIcon size={theme.icon.size.md} />}
      title={
        <RecordIndexPageHeaderTitle
          label={t(
            AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus],
          )}
          numberOfSelectedRecords={selectedThreadCount}
        />
      }
      actionButton={
        selectedThreadCount > 0 ? (
          <>
            <CommandMenuContextProvider
              displayType="button"
              containerType={CommandMenuItemContainerType.IndexPageHeader}
            >
              <AiChatInboxTriageCommandMenuItems>
                <PinnedCommandMenuItemButtons />
              </AiChatInboxTriageCommandMenuItems>
            </CommandMenuContextProvider>
            <SidePanelToggleButton />
          </>
        ) : (
          <>
            {!isMobile && <AiChatInboxLayoutDropdown />}
            <Button
              size="sm"
              variant="solid"
              color="accent"
              startIcon={<IconPlus />}
              onClick={switchToNewChat}
            >
              {t`New chat`}
            </Button>
            {/* In split view the chat beside the list has the command menu */}
            {!isSplitView && <SidePanelToggleButton />}
          </>
        )
      }
    />
  );
};
