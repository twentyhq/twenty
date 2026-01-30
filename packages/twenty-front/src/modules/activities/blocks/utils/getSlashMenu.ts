import { getDefaultReactSlashMenuItems } from '@blocknote/react';

import { type SuggestionItem } from '@/ui/input/editor/components/CustomSlashMenu';

import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import {
  IconBlockquote,
  IconCode,
  type IconComponent,
  IconFile,
  IconH1,
  IconH2,
  IconH3,
  IconHeadphones,
  IconList,
  IconListCheck,
  IconListNumbers,
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
    ...getDefaultReactSlashMenuItems(editor).map((x) => ({
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
