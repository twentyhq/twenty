import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatInboxLayoutDropdown } from '@/ai/components/AiChatInboxLayoutDropdown';
import { AiChatInboxTriageCommandMenuItems } from '@/ai/components/AiChatInboxTriageCommandMenuItems';
import { useAgentChatInboxViewHeading } from '@/ai/hooks/useAgentChatInboxViewHeading';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { RecordIndexPageHeaderTitle } from '@/object-record/record-index/components/RecordIndexPageHeaderTitle';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';

type AiChatInboxListHeaderProps = {
  selectedThreadCount: number;
  isSecondaryPaneShown: boolean;
};

export const AiChatInboxListHeader = ({
  selectedThreadCount,
  isSecondaryPaneShown,
}: AiChatInboxListHeaderProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { HeadingIcon, headingLabel } = useAgentChatInboxViewHeading();
  const isMobile = useIsMobile();
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });
  const { resetRecordSelection } = useResetRecordSelection();

  const handleNewChat = () => {
    resetRecordSelection();
    switchToNewChat();
  };

  return (
    <PageCardHeader
      icon={<HeadingIcon size={theme.icon.size.md} />}
      title={
        <RecordIndexPageHeaderTitle
          label={headingLabel}
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
