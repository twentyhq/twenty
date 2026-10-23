import { useLiveEditorState } from '@/advanced-text-editor/hooks/useLiveEditorState';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { useLingui } from '@lingui/react/macro';
import { type ChainedCommands, type Editor } from '@tiptap/core';
import { type Level } from '@tiptap/extension-heading';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconBlockquote,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconTextSize,
} from 'twenty-ui/icon';

export type TurnIntoBlockOptions = {
  title: string;
  id: string;
  disabled: () => boolean;
  isActive: () => boolean;
  onClick: () => void;
  icon: IconComponent;
};

const HEADING_LEVELS: Level[] = [1, 2, 3, 4, 5, 6];

const HEADING_ICONS: Record<number, IconComponent> = {
  1: IconH1,
  2: IconH2,
  3: IconH3,
  4: IconH4,
  5: IconH5,
  6: IconH6,
};

export const useTurnIntoBlockOptions = (editor: Editor) => {
  const { t } = useLingui();

  const headingTitles: Record<number, string> = {
    1: t`Heading 1`,
    2: t`Heading 2`,
    3: t`Heading 3`,
    4: t`Heading 4`,
    5: t`Heading 5`,
    6: t`Heading 6`,
  };

  return useLiveEditorState(editor, (currentEditor): TurnIntoBlockOptions[] => {
    const isInBlockquote = currentEditor.isActive(TIPTAP_NODE_TYPES.BLOCKQUOTE);

    const liftOutOfBlockquote = (chain: ChainedCommands) =>
      isInBlockquote ? chain.lift(TIPTAP_NODE_TYPES.BLOCKQUOTE) : chain;

    const configuredHeadingLevels: number[] =
      currentEditor.extensionManager.extensions.find(
        ({ name }) => name === TIPTAP_NODE_TYPES.HEADING,
      )?.options.levels ?? [];

    return [
      {
        id: 'paragraph',
        title: t`Text`,
        icon: IconTextSize,
        onClick: () => {
          return liftOutOfBlockquote(currentEditor.chain().focus())
            .setParagraph()
            .run();
        },
        disabled: () => {
          return isInBlockquote
            ? !currentEditor.can().lift(TIPTAP_NODE_TYPES.BLOCKQUOTE)
            : !currentEditor.can().setParagraph();
        },
        isActive: () => {
          return currentEditor.isActive('paragraph') && !isInBlockquote;
        },
      },
      ...HEADING_LEVELS.filter((level) =>
        configuredHeadingLevels.includes(level),
      ).map((level) => ({
        id: `heading${level}`,
        title: headingTitles[level],
        icon: HEADING_ICONS[level],
        onClick: () => {
          return liftOutOfBlockquote(currentEditor.chain().focus())
            .setHeading({ level })
            .run();
        },
        disabled: () => {
          return isInBlockquote
            ? !currentEditor.can().lift(TIPTAP_NODE_TYPES.BLOCKQUOTE)
            : !currentEditor.can().setHeading({ level });
        },
        isActive: () => {
          return currentEditor.isActive('heading', { level });
        },
      })),
      ...(hasEditorExtension(currentEditor, TIPTAP_NODE_TYPES.BLOCKQUOTE)
        ? [
            {
              id: 'blockquote',
              title: t`Quote`,
              icon: IconBlockquote,
              onClick: () => {
                return currentEditor
                  .chain()
                  .focus()
                  .setParagraph()
                  .toggleBlockquote()
                  .run();
              },
              disabled: () => {
                return (
                  !currentEditor.can().toggleBlockquote() &&
                  !currentEditor.can().setParagraph()
                );
              },
              isActive: () => isInBlockquote,
            },
          ]
        : []),
    ];
  });
};
