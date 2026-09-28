import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { useRef } from 'react';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import {
  IconAddressBook,
  IconBook,
  IconPaperclip,
  IconPlus,
} from 'twenty-ui/icon';

import { AiChatAddMenuRecordsPage } from '@/ai/components/AiChatAddMenuRecordsPage';
import { AiChatAddMenuSkillsPage } from '@/ai/components/AiChatAddMenuSkillsPage';
import { AgentChatFileInput } from '@/ai/components/internal/AgentChatFileInput';
import { AI_CHAT_ADD_MENU_PAGE } from '@/ai/constants/AiChatAddMenuPage';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const AI_CHAT_ADD_MENU_WIDTH_PX = 280;

type AiChatAddMenuProps = {
  editor: Editor | null;
};

export const AiChatAddMenu = ({ editor }: AiChatAddMenuProps) => {
  const { t } = useLingui();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <AgentChatFileInput ref={fileInputRef} />
      <DropdownRoot
        dropdownId="ai-chat-add-menu-dropdown"
        type="menu"
        defaultPage={AI_CHAT_ADD_MENU_PAGE.ROOT}
      >
        <Dropdown.Trigger
          render={
            <LightIconButton
              aria-label={t`Add files, records or skills`}
              size="sm"
            >
              <IconPlus />
            </LightIconButton>
          }
        />
        <DropdownContent
          width={AI_CHAT_ADD_MENU_WIDTH_PX}
          side="top"
          align="start"
          sideOffset={8}
          aria-label={t`Add files, records or skills`}
        >
          <Dropdown.Page id={AI_CHAT_ADD_MENU_PAGE.ROOT} type="menu">
            <Dropdown.Section>
              <Dropdown.ActionItem
                startIcon={<IconPaperclip />}
                onClick={() => fileInputRef.current?.click()}
              >
                {t`Attach files`}
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                startIcon={<IconAddressBook />}
                hotkeys={['@']}
                page={AI_CHAT_ADD_MENU_PAGE.RECORDS}
              >
                {t`Records`}
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                startIcon={<IconBook />}
                hotkeys={['/']}
                page={AI_CHAT_ADD_MENU_PAGE.SKILLS}
              >
                {t`Skills`}
              </Dropdown.ActionItem>
            </Dropdown.Section>
          </Dropdown.Page>
          <Dropdown.Page id={AI_CHAT_ADD_MENU_PAGE.RECORDS} type="picker">
            <AiChatAddMenuRecordsPage editor={editor} />
          </Dropdown.Page>
          <Dropdown.Page id={AI_CHAT_ADD_MENU_PAGE.SKILLS} type="picker">
            <AiChatAddMenuSkillsPage editor={editor} />
          </Dropdown.Page>
        </DropdownContent>
      </DropdownRoot>
    </>
  );
};
