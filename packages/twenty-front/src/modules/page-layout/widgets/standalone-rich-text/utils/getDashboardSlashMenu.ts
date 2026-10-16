import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import { t } from '@lingui/core/macro';

import { type SuggestionItem } from '@/blocknote-editor/types/SuggestionMenuItems';
import { type DASHBOARD_BLOCK_SCHEMA } from '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema';
import {
  IconBlockquote,
  IconCode,
  type IconComponent,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconMoodSmile,
  IconTable,
  IconTextSize,
} from 'twenty-ui/icon';
import { doNotTranslate } from 'twenty-shared/i18n';

const Icons: Record<string, IconComponent> = {
  'Heading 1': IconH1,
  'Heading 2': IconH2,
  'Heading 3': IconH3,
  'Heading 4': IconH4,
  'Heading 5': IconH5,
  'Heading 6': IconH6,
  'Toggle Heading 1': IconH1,
  'Toggle Heading 2': IconH2,
  'Toggle Heading 3': IconH3,
  Quote: IconBlockquote,
  'Numbered List': IconListNumbers,
  'Bullet List': IconList,
  'Check List': IconListCheck,
  'Code Block': IconCode,
  Paragraph: IconTextSize,
  Table: IconTable,
  Emoji: IconMoodSmile,
};

const EXCLUDED_BLOCK_TYPES = doNotTranslate([
  'Image',
  'Video',
  'Audio',
  'File',
]);

export const getDashboardSlashMenu = (
  editor: typeof DASHBOARD_BLOCK_SCHEMA.BlockNoteEditor,
) => {
  const items: SuggestionItem[] = getDefaultReactSlashMenuItems(editor)
    .filter((item) => !EXCLUDED_BLOCK_TYPES.includes(item.title))
    .map((item) => ({
      ...item,
      title: item.title === 'Paragraph' ? t`Text` : item.title,
      Icon: Icons[item.title],
    }));

  return items;
};
