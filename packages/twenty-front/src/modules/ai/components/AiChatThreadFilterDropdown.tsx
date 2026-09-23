import { useLingui } from '@lingui/react/macro';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconFilter } from 'twenty-ui/icon';

import { AiChatThreadFilterDropdownContent } from '@/ai/components/AiChatThreadFilterDropdownContent';
import { AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';
import { useDropdownFocus } from '@/ui/utilities/focus/hooks/useDropdownFocus';

export const AiChatThreadFilterDropdown = () => {
  const { t } = useLingui();
  const { updateDropdownFocus } = useDropdownFocus();

  return (
    <Dropdown.Root
      kind="menu"
      defaultPage={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.ROOT}
      onOpenChange={updateDropdownFocus}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`Filter chats`}
            emphasis="subtle"
            size="sm"
          >
            <IconFilter />
          </LightIconButton>
        }
      />
      <Dropdown.Content align="end" aria-label={t`Filter chats`}>
        <AiChatThreadFilterDropdownContent />
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
