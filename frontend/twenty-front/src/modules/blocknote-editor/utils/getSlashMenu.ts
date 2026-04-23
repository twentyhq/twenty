import { getDefaultReactSlashMenuItems } from '@blocknote/react';

import { type SuggestionItem } from '@/blocknote-editor/types/types';

import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import {
  IconBlockquote,
  IconCode,
  type IconComponent,
  IconFile,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconHeadphones,
  IconList,
  IconListCheck,
  IconListDetails,
  IconListNumbers,
  IconMinus,
  IconMoodSmile,
  IconPhoto,
  IconPilcrow,
  IconTable,
  IconVideo,
} from 'twenty-ui/display';

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
  'Toggle List': IconListDetails,
  Divider: IconMinus,
  Quote: IconBlockquote,
  'Numbered List': IconListNumbers,
  'Bullet List': IconList,
  'Check List': IconListCheck,
  'Code Block': IconCode,
  Paragraph: IconPilcrow,
  Table: IconTable,
  Image: IconPhoto,
  Video: IconVideo,
  Audio: IconHeadphones,
  Emoji: IconMoodSmile,
};

export const getSlashMenu = (editor: typeof BLOCK_SCHEMA.BlockNoteEditor) => {
  const items: SuggestionItem[] = [
    ...getDefaultReactSlashMenuItems(editor)
      .filter((item) => item.title !== 'File')
      .map((x) => ({
        ...x,
        Icon: Icons[x.title],
      })),
    {
      title: 'File',
      aliases: ['file', 'folder'],
      Icon: IconFile,
      onItemClick: () => {
        const currentBlock = editor.getTextCursorPosition().block;

        editor.insertBlocks(
          [
            {
              type: 'file',
              props: {
                url: undefined,
              },
            },
          ],
          currentBlock,
          'before',
        );
      },
    },
  ];
  return items;
};
