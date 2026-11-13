import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useIsMobile } from 'twenty-ui/utilities';

import { InboxChannelViewDropdown } from '@/ai/components/InboxChannelViewDropdown';
import { InboxLayoutDropdown } from '@/ai/components/InboxLayoutDropdown';
import { InboxTriageCommandMenuItems } from '@/ai/components/InboxTriageCommandMenuItems';
import { InboxPersonalViewDropdown } from '@/ai/components/InboxPersonalViewDropdown';
import { InboxViewHeading } from '@/ai/components/InboxViewHeading';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { inboxSelectedChannelViewSelector } from '@/ai/states/selectors/inboxSelectedChannelViewSelector';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type InboxListHeaderProps = {
  selectedThreadCount: number;
  isSecondaryPaneShown: boolean;
};

export const InboxListHeader = ({
  selectedThreadCount,
  isSecondaryPaneShown,
}: InboxListHeaderProps) => {
  const { t } = useLingui();
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
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

  const viewDropdown = isDefined(inboxSelectedChannelView) ? (
    <InboxChannelViewDropdown channelView={inboxSelectedChannelView} />
  ) : (
    <InboxPersonalViewDropdown />
  );

  return (
    <PageCardHeader
      title={<InboxViewHeading selectedThreadCount={selectedThreadCount} />}
      actionButton={
        selectedThreadCount > 0 ? (
          <>
            <CommandMenuContextProvider
              displayType="button"
              containerType={CommandMenuItemContainerType.IndexPageHeader}
            >
              <InboxTriageCommandMenuItems>
                <PinnedCommandMenuItemButtons />
              </InboxTriageCommandMenuItems>
            </CommandMenuContextProvider>
            {viewDropdown}
            <SidePanelToggleButton />
          </>
        ) : (
          <>
            {!isMobile && <InboxLayoutDropdown />}
            {viewDropdown}
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
