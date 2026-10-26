import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatInboxChannelViewDropdown } from '@/ai/components/AiChatInboxChannelViewDropdown';
import { AiChatInboxLayoutDropdown } from '@/ai/components/AiChatInboxLayoutDropdown';
import { AiChatInboxTriageCommandMenuItems } from '@/ai/components/AiChatInboxTriageCommandMenuItems';
import { AiChatInboxViewHeading } from '@/ai/components/AiChatInboxViewHeading';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatInboxListHeaderProps = {
  selectedThreadCount: number;
  isSecondaryPaneShown: boolean;
};

export const AiChatInboxListHeader = ({
  selectedThreadCount,
  isSecondaryPaneShown,
}: AiChatInboxListHeaderProps) => {
  const { t } = useLingui();
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const isMobile = useIsMobile();
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });
  const { resetRecordSelection } = useResetRecordSelection();

  const handleNewChat = () => {
    resetRecordSelection();
    switchToNewChat();
  };

  const channelViewDropdown = isDefined(agentChatShownChannelView) && (
    <AiChatInboxChannelViewDropdown channelView={agentChatShownChannelView} />
  );

  return (
    <PageCardHeader
      title={
        <AiChatInboxViewHeading selectedThreadCount={selectedThreadCount} />
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
            {channelViewDropdown}
            <SidePanelToggleButton />
          </>
        ) : (
          <>
            {!isMobile && <AiChatInboxLayoutDropdown />}
            {channelViewDropdown}
            <Button
              size="sm"
              variant="solid"
              color="accent"
              startIcon={<IconPlus />}
              onClick={handleNewChat}
            >
              {t`New chat`}
            </Button>
            {!isSecondaryPaneShown && <SidePanelToggleButton />}
          </>
        )
      }
    />
  );
};
