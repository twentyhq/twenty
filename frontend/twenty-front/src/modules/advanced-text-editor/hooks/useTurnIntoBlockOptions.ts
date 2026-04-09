import { useLingui } from '@lingui/react/macro';
import { type Editor, useEditorState } from '@tiptap/react';
import {
  type IconComponent,
  IconH1,
  IconH2,
  IconH3,
  IconPilcrow,
} from 'twenty-ui/display';

export type TurnIntoBlockOptions = {
  title: string;
  id: string;
  disabled: () => boolean;
  isActive: () => boolean;
  onClick: () => void;
  icon: IconComponent;
};

export const useTurnIntoBlockOptions = (editor: Editor) => {
  const { t } = useLingui();

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
      {
        id: 'heading1',
        title: t`Heading 1`,
        icon: IconH1,
        onClick: () => {
          return editor.chain().focus().setHeading({ level: 1 }).run();
        },
        disabled: () => {
          return !editor.can().setHeading({ level: 1 });
        },
        isActive: () => {
          return editor.isActive('heading', { level: 1 });
        },
      },
      {
        id: 'heading2',
        title: t`Heading 2`,
        icon: IconH2,
        onClick: () => {
          return editor.chain().focus().setHeading({ level: 2 }).run();
        },
        disabled: () => {
          return !editor.can().setHeading({ level: 2 });
        },
        isActive: () => {
          return editor.isActive('heading', { level: 2 });
        },
      },
      {
        id: 'heading3',
        title: t`Heading 3`,
        icon: IconH3,
        onClick: () => {
          return editor.chain().focus().setHeading({ level: 3 }).run();
        },
        disabled: () => {
          return !editor.can().setHeading({ level: 3 });
        },
        isActive: () => {
          return editor.isActive('heading', { level: 3 });
        },
      },
    ],
  });
};
