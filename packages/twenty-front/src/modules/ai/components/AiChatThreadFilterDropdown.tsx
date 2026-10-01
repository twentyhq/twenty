import { useLingui } from '@lingui/react/macro';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconFilter } from 'twenty-ui/icon';

import { AiChatThreadFilterDropdownContent } from '@/ai/components/AiChatThreadFilterDropdownContent';
import { AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE } from '@/ai/constants/AiChatThreadFilterDropdownPage';
import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
import { getAiChatThreadFilterDropdownId } from '@/ai/utils/getAiChatThreadFilterDropdownId';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type AiChatThreadFilterDropdownProps = {
  surface: AiChatThreadActionsSurface;
};

export const AiChatThreadFilterDropdown = ({
  surface,
}: AiChatThreadFilterDropdownProps) => {
  const { t } = useLingui();

  return (
    <DropdownRoot
      dropdownId={getAiChatThreadFilterDropdownId(surface)}
      type="menu"
      defaultPage={AI_CHAT_THREAD_FILTER_DROPDOWN_PAGE.ROOT}
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
    </DropdownRoot>
  );
};
