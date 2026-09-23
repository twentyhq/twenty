import { Dropdown } from 'twenty-ui/components';

import { AiChatThreadFilterDropdownGroupByMenu } from '@/ai/components/AiChatThreadFilterDropdownGroupByMenu';
import { AiChatThreadFilterDropdownLastActivityMenu } from '@/ai/components/AiChatThreadFilterDropdownLastActivityMenu';
import { AiChatThreadFilterDropdownRootMenu } from '@/ai/components/AiChatThreadFilterDropdownRootMenu';
import { AiChatThreadFilterDropdownStatusMenu } from '@/ai/components/AiChatThreadFilterDropdownStatusMenu';
import { AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';

export const AiChatThreadFilterDropdownContent = () => (
  <>
    <Dropdown.Page id={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.ROOT} type="menu">
      <AiChatThreadFilterDropdownRootMenu />
    </Dropdown.Page>
    <Dropdown.Page
      id={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.STATUS}
      type="picker"
    >
      <AiChatThreadFilterDropdownStatusMenu />
    </Dropdown.Page>
    <Dropdown.Page
      id={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.GROUP_BY}
      type="picker"
    >
      <AiChatThreadFilterDropdownGroupByMenu />
    </Dropdown.Page>
    <Dropdown.Page
      id={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.LAST_ACTIVITY}
      type="picker"
    >
      <AiChatThreadFilterDropdownLastActivityMenu />
    </Dropdown.Page>
  </>
);
