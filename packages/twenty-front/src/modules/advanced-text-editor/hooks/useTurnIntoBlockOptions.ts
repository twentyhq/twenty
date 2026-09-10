import { useLiveEditorState } from '@/advanced-text-editor/hooks/useLiveEditorState';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
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

  return useLiveEditorState(editor, (currentEditor): TurnIntoBlockOptions[] => [
    {
      id: 'paragraph',
      title: t`Paragraph`,
      icon: IconPilcrow,
      onClick: () => {
        return currentEditor.chain().focus().setParagraph().run();
      },
      disabled: () => {
        return !currentEditor.can().setParagraph();
      },
      isActive: () => {
        return currentEditor.isActive('paragraph');
      },
    },
    ...(hasEditorExtension(currentEditor, 'heading')
      ? ([1, 2, 3] as const).map((level) => ({
          id: `heading${level}`,
          title: headingTitles[level],
          icon: HEADING_ICONS[level],
          onClick: () => {
            return currentEditor.chain().focus().setHeading({ level }).run();
          },
          disabled: () => {
            return !currentEditor.can().setHeading({ level });
          },
          isActive: () => {
            return currentEditor.isActive('heading', { level });
          },
        }))
      : []),
  ]);
};
