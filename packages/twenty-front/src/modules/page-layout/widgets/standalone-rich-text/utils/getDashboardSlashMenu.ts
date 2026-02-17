import { getDefaultReactSlashMenuItems } from '@blocknote/react';

import { type SuggestionItem } from '@/blocknote-editor/types/types';
import { type DASHBOARD_BLOCK_SCHEMA } from '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema';
import {
  IconBlockquote,
  IconCode,
  type IconComponent,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconMoodSmile,
  IconPilcrow,
  IconTable,
} from 'twenty-ui/display';

const Icons: Record<string, IconComponent> = {
  'Heading 1': IconH1,
  'Heading 2': IconH2,
  'Heading 3': IconH3,
  Quote: IconBlockquote,
  'Numbered List': IconListNumbers,
  'Bullet List': IconList,
  'Check List': IconListCheck,
  'Code Block': IconCode,
  Paragraph: IconPilcrow,
  Table: IconTable,
  Emoji: IconMoodSmile,
};

const EXCLUDED_BLOCK_TYPES = ['Image', 'Video', 'Audio', 'File'];

export const getDashboardSlashMenu = (
  editor: typeof DASHBOARD_BLOCK_SCHEMA.BlockNoteEditor,
) => {
  const items: SuggestionItem[] = getDefaultReactSlashMenuItems(editor)
    .filter((item) => !EXCLUDED_BLOCK_TYPES.includes(item.title))
    .map((item) => ({
      ...item,
      Icon: Icons[item.title],
    }));

  return items;
};
