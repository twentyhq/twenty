import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { useLingui } from '@lingui/react/macro';
import { type Editor, useEditorState } from '@tiptap/react';
import {
  type IconComponent,
  IconH1,
  IconH2,
  IconH3,
  IconPilcrow,
} from 'twenty-ui/icon';

export type TurnIntoBlockOptions = {
  title: string;
  id: string;
  disabled: () => boolean;
  isActive: () => boolean;
  onClick: () => void;
  icon: IconComponent;
};

const HEADING_ICONS: Record<number, IconComponent> = {
  1: IconH1,
  2: IconH2,
  3: IconH3,
};

export const useTurnIntoBlockOptions = (editor: Editor) => {
  const { t } = useLingui();

  const headingTitles: Record<number, string> = {
    1: t`Heading 1`,
    2: t`Heading 2`,
    3: t`Heading 3`,
  };

  return useEditorState({
    editor,
    selector: ({ editor }): TurnIntoBlockOptions[] => [
      {
        id: 'paragraph',
        title: t`Paragraph`,
        icon: IconPilcrow,
        onClick: () => {
          return editor.chain().focus().setParagraph().run();
        },
        disabled: () => {
          return !editor.can().setParagraph();
        },
        isActive: () => {
          return editor.isActive('paragraph');
        },
      },
      ...(hasEditorExtension(editor, 'heading')
        ? ([1, 2, 3] as const).map((level) => ({
            id: `heading${level}`,
            title: headingTitles[level],
            icon: HEADING_ICONS[level],
            onClick: () => {
              return editor.chain().focus().setHeading({ level }).run();
            },
            disabled: () => {
              return !editor.can().setHeading({ level });
            },
            isActive: () => {
              return editor.isActive('heading', { level });
            },
          }))
        : []),
    ],
  });
};
