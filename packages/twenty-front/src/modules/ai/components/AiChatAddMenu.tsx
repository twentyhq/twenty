import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { useId, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, IconButton } from 'twenty-ui/components';
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
  const instanceId = useId();

  return (
    <>
      <AgentChatFileInput ref={fileInputRef} />
      <DropdownRoot
        dropdownId={`ai-chat-add-menu-${instanceId}`}
        type="menu"
        defaultPage={AI_CHAT_ADD_MENU_PAGE.ROOT}
      >
        <Dropdown.Trigger
          render={
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={t`Add files, records or skills`}
            >
              <IconPlus />
            </IconButton>
          }
        />
        <DropdownContent
          width={AI_CHAT_ADD_MENU_WIDTH_PX}
          side="top"
          align="start"
          sideOffset={8}
          finalFocus={(interaction) =>
            interaction === 'keyboard' && isDefined(editor)
              ? editor.view.dom
              : false
          }
          aria-label={t`Add files, records or skills`}
        >
          <Dropdown.Page id={AI_CHAT_ADD_MENU_PAGE.ROOT} type="menu">
            <Dropdown.Section>
              <Dropdown.ActionItem
                startIcon={<IconPaperclip />}
                onClick={() => {
                  editor?.view.focus();
                  fileInputRef.current?.click();
                }}
              >
                {t`Attach files`}
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                startIcon={<IconAddressBook />}
                shortcut={['@']}
                page={AI_CHAT_ADD_MENU_PAGE.RECORDS}
              >
                {t`Records`}
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                startIcon={<IconBook />}
                shortcut={['/']}
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
