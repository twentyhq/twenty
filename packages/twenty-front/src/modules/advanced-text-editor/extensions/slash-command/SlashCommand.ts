import SlashCommandMenu from '@/advanced-text-editor/extensions/slash-command/SlashCommandMenu';
import { Extension, type Editor } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  IconBold,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconPilcrow,
  IconStrikethrough,
  IconUnderline,
  type IconComponent,
} from 'twenty-ui/display';

export type SlashCommandItem = {
  id: string;
  title: string;
  description?: string;
  icon?: IconComponent;
  keywords?: string[];
  isActive?: () => boolean;
  isVisible?: () => boolean;
  onSelect: () => void;
};

const buildItems = (editor: Editor, query: string): SlashCommandItem[] => {
  const normalized = query.trim().toLowerCase();

  const candidates: SlashCommandItem[] = [
    {
      id: 'paragraph',
      title: 'Text',
      description: 'Plain text paragraph',
      icon: IconPilcrow,
      keywords: ['paragraph', 'text', 'p'],
      isActive: () => editor.isActive('paragraph'),
      isVisible: () => editor.can().setParagraph?.() ?? true,
      onSelect: () => editor.chain().focus().setParagraph().run(),
    },
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Large section heading',
      icon: IconH1,
      keywords: ['heading', 'h1', 'title'],
      isActive: () => editor.isActive('heading', { level: 1 }),
      isVisible: () => editor.can().setHeading?.({ level: 1 }) ?? false,
      onSelect: () => editor.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: IconH2,
      keywords: ['heading', 'h2', 'subtitle'],
      isActive: () => editor.isActive('heading', { level: 2 }),
      isVisible: () => editor.can().setHeading?.({ level: 2 }) ?? false,
      onSelect: () => editor.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Small section heading',
      icon: IconH3,
      keywords: ['heading', 'h3', 'subheading'],
      isActive: () => editor.isActive('heading', { level: 3 }),
      isVisible: () => editor.can().setHeading?.({ level: 3 }) ?? false,
      onSelect: () => editor.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      id: 'bold',
      title: 'Bold',
      description: 'Make text bold',
      icon: IconBold,
      keywords: ['bold', 'strong', 'b'],
      isActive: () => editor.isActive('bold'),
      isVisible: () => editor.can().toggleBold?.() ?? false,
      onSelect: () => editor.chain().focus().toggleBold().run(),
    },
    {
      id: 'italic',
      title: 'Italic',
      description: 'Make text italic',
      icon: IconItalic,
      keywords: ['italic', 'em', 'i'],
      isActive: () => editor.isActive('italic'),
      isVisible: () => editor.can().toggleItalic?.() ?? false,
      onSelect: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      id: 'underline',
      title: 'Underline',
      description: 'Underline text',
      icon: IconUnderline,
      keywords: ['underline', 'u'],
      isActive: () => editor.isActive('underline'),
      isVisible: () => editor.can().toggleUnderline?.() ?? false,
      onSelect: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      id: 'strike',
      title: 'Strikethrough',
      description: 'Strike through text',
      icon: IconStrikethrough,
      keywords: ['strikethrough', 'strike', 'del'],
      isActive: () => editor.isActive('strike'),
      isVisible: () => editor.can().toggleStrike?.() ?? false,
      onSelect: () => editor.chain().focus().toggleStrike().run(),
    },
  ];

  const visible = candidates.filter((c) =>
    c.isVisible ? c.isVisible() : true,
  );

  if (!normalized) return visible;

  return visible.filter((c) => {
    const hay = `${c.title} ${(c.keywords ?? []).join(' ')}`.toLowerCase();
    return hay.includes(normalized);
  });
};

export const SlashCommand = Extension.create({
  name: 'slash-command',
  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        startOfLine: false,
        allowSpaces: true,
        command: ({ editor: ed, range, props }) => {
          ed.chain().focus().deleteRange(range).run();
          props.onSelect();
        },
        items: ({ query }) => {
          return buildItems(editor, query);
        },
        render: () => {
          let componentRoot: Root | null = null;
          let selectedIndex = 0;
          let currentItems: SlashCommandItem[] = [];
          let currentCommand: (item: SlashCommandItem) => void = () => {};
          let currentRect: DOMRect | null = null;

          const renderComponent = (
            items: SlashCommandItem[],
            command: (item: SlashCommandItem) => void,
            selectedIdx: number,
            rect: DOMRect | null,
            root?: Root | null,
          ): Root => {
            const reactRoot =
              root ||
              createRoot(
                document.body.appendChild(document.createElement('div')),
              );
            reactRoot.render(
              createElement(SlashCommandMenu, {
                items,
                selectedIndex: selectedIdx,
                onSelect: command,
                clientRect: rect,
              }),
            );
            return reactRoot;
          };

          const cleanup = () => {
            if (componentRoot !== null) {
              componentRoot.unmount();
              componentRoot = null;
            }
            selectedIndex = 0;
            currentRect = null;
          };

          return {
            onStart: (props) => {
              const rect = props.clientRect?.();
              if (!rect) return;

              currentItems = props.items;
              currentCommand = props.command;
              currentRect = rect;

              componentRoot = renderComponent(
                currentItems,
                currentCommand,
                selectedIndex,
                currentRect,
              );
            },
            onUpdate: (props) => {
              const rect = props.clientRect?.();
              if (!rect) return;

              currentItems = props.items;
              currentCommand = props.command;
              currentRect = rect;

              if (componentRoot !== null) {
                componentRoot = renderComponent(
                  currentItems,
                  currentCommand,
                  selectedIndex,
                  currentRect,
                  componentRoot,
                );
              }
            },
            onKeyDown: (props) => {
              const { event } = props;
              if (event.key === 'Escape') {
                // Close menu by removing container
                cleanup();
                return true;
              }
              if (event.key === 'ArrowDown') {
                selectedIndex = Math.min(
                  selectedIndex + 1,
                  (currentItems?.length || 1) - 1,
                );
                if (componentRoot !== null) {
                  componentRoot = renderComponent(
                    currentItems,
                    currentCommand,
                    selectedIndex,
                    currentRect,
                    componentRoot,
                  );
                }
                return true;
              }
              if (event.key === 'ArrowUp') {
                selectedIndex = Math.max(selectedIndex - 1, 0);
                if (componentRoot !== null) {
                  componentRoot = renderComponent(
                    currentItems,
                    currentCommand,
                    selectedIndex,
                    currentRect,
                    componentRoot,
                  );
                }
                return true;
              }
              if (event.key === 'Enter') {
                const item = currentItems[selectedIndex];
                if (item !== undefined) {
                  currentCommand(item);
                  return true;
                }
              }
              return false;
            },
            onExit: () => {
              cleanup();
            },
          };
        },
      }),
    ];
  },
});

export default SlashCommand;
