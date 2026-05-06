import { AiChatThreadFilterDropdownGroupByMenu } from '@/ai/components/AiChatThreadFilterDropdownGroupByMenu';
import { AiChatThreadFilterDropdownLastActivityMenu } from '@/ai/components/AiChatThreadFilterDropdownLastActivityMenu';
import { AiChatThreadFilterDropdownRootMenu } from '@/ai/components/AiChatThreadFilterDropdownRootMenu';
import { AiChatThreadFilterDropdownStatusMenu } from '@/ai/components/AiChatThreadFilterDropdownStatusMenu';
import { AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';
import { type AiChatThreadFilterDropdownPage } from '@/ai/types/AiChatThreadFilterDropdownPage';

type AiChatThreadFilterDropdownContentProps = {
  page: AiChatThreadFilterDropdownPage;
  dropdownId: string;
  onSelectPage: (page: AiChatThreadFilterDropdownPage) => void;
  onBack: () => void;
};

export const AiChatThreadFilterDropdownContent = ({
  page,
  dropdownId,
  onSelectPage,
  onBack,
}: AiChatThreadFilterDropdownContentProps) => {
  switch (page) {
    case AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.STATUS:
      return <AiChatThreadFilterDropdownStatusMenu onBack={onBack} />;
    case AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.GROUP_BY:
      return <AiChatThreadFilterDropdownGroupByMenu onBack={onBack} />;
    case AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.LAST_ACTIVITY:
      return <AiChatThreadFilterDropdownLastActivityMenu onBack={onBack} />;
    case AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.ROOT:
    default:
      return (
        <AiChatThreadFilterDropdownRootMenu
          dropdownId={dropdownId}
          onSelectPage={onSelectPage}
        />
      );
  }
};
