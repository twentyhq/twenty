import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import {
  IconComponent,
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
} from 'twenty-ui';

import { SuggestionItem } from '@/ui/input/editor/components/CustomSlashMenu';

import { BLOCK_SCHEMA } from '../constants/Schema';

const Icons: Record<string, IconComponent> = {
  'Heading 1': IconH1,
  'Heading 2': IconH2,
  'Heading 3': IconH3,
  'Numbered List': IconListNumbers,
  'Bullet List': IconList,
  'Check List': IconListCheck,
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
