import SlashCommandMenu from '@/advanced-text-editor/extensions/slash-command/SlashCommandMenu';
import { Extension, type Editor } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { createElement } from 'react';
import { createPortal } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

export type SlashCommandItem = {
  id: string;
  title: string;
  keywords?: string[];
  isActive?: () => boolean;
  isVisible?: () => boolean;
  onSelect: () => void;
};

// Helper function to calculate menu position
const calculateMenuPosition = (clientRect: DOMRect) => {
  const menuHeight = 200; // estimated menu height
  const menuWidth = 240; // menu width
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const spaceBelow = viewportHeight - clientRect.bottom;
  const spaceAbove = clientRect.top;

  // Calculate vertical position
  let top: number;
  if (spaceBelow > menuHeight || spaceBelow > spaceAbove) {
    // Show below cursor
    top = clientRect.bottom + 4;
  } else {
    // Show above cursor
    top = clientRect.top - menuHeight - 4;
  }

  // Calculate horizontal position (keep menu in viewport)
  const left = Math.max(
    4,
    Math.min(clientRect.left, viewportWidth - menuWidth - 4),
  );

  return { top, left };
};

const buildItems = (editor: Editor, query: string): SlashCommandItem[] => {
  const normalized = query.trim().toLowerCase();

  const candidates: SlashCommandItem[] = [
    {
      id: 'paragraph',
      title: 'Paragraph',
      isActive: () => editor.isActive('paragraph'),
      isVisible: () => editor.can().setParagraph?.() ?? true,
      onSelect: () => editor.chain().focus().setParagraph().run(),
    },
    {
      id: 'h1',
      title: 'Heading 1',
      isActive: () => editor.isActive('heading', { level: 1 }),
      isVisible: () => editor.can().setHeading?.({ level: 1 }) ?? false,
      onSelect: () => editor.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      id: 'h2',
      title: 'Heading 2',
      isActive: () => editor.isActive('heading', { level: 2 }),
      isVisible: () => editor.can().setHeading?.({ level: 2 }) ?? false,
      onSelect: () => editor.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      id: 'h3',
      title: 'Heading 3',
      isActive: () => editor.isActive('heading', { level: 3 }),
      isVisible: () => editor.can().setHeading?.({ level: 3 }) ?? false,
      onSelect: () => editor.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      id: 'bold',
      title: 'Bold',
      isActive: () => editor.isActive('bold'),
      isVisible: () => editor.can().toggleBold?.() ?? false,
      onSelect: () => editor.chain().focus().toggleBold().run(),
    },
    {
      id: 'italic',
      title: 'Italic',
      isActive: () => editor.isActive('italic'),
      isVisible: () => editor.can().toggleItalic?.() ?? false,
      onSelect: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      id: 'underline',
      title: 'Underline',
      isActive: () => editor.isActive('underline'),
      isVisible: () => editor.can().toggleUnderline?.() ?? false,
      onSelect: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      id: 'strike',
      title: 'Strikethrough',
      isActive: () => editor.isActive('strike'),
      isVisible: () => editor.can().toggleStrike?.() ?? false,
      onSelect: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      id: 'hard-break',
      title: 'Line break',
      onSelect: () => editor.chain().focus().setHardBreak().run(),
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
          let container: HTMLElement | null = null;
          let selectedIndex = 0;
          let currentItems: SlashCommandItem[] = [];
          let currentCommand: (item: SlashCommandItem) => void = () => {};

          // Helper function to create and position container
          const createContainer = (rect: DOMRect): HTMLElement => {
            const newContainer = document.createElement('div');
            newContainer.style.position = 'fixed';
            newContainer.style.zIndex = '9999';
            newContainer.style.pointerEvents = 'auto';

            // Calculate and set position
            const position = calculateMenuPosition(rect);
            newContainer.style.top = `${position.top}px`;
            newContainer.style.left = `${position.left}px`;

            document.body.appendChild(newContainer);
            return newContainer;
          };

          // Helper function to render the React component
          const renderComponent = (
            containerElement: HTMLElement,
            items: SlashCommandItem[],
            command: (item: SlashCommandItem) => void,
            selectedIdx: number,
            root?: Root | null,
          ): Root => {
            const reactRoot = root || createRoot(containerElement);
            reactRoot.render(
              createPortal(
                createElement(SlashCommandMenu, {
                  items,
                  selectedIndex: selectedIdx,
                  onSelect: command,
                }),
                containerElement,
              ),
            );
            return reactRoot;
          };

          // Helper function to cleanup container and component root
          const cleanup = () => {
            if (componentRoot !== null) {
              componentRoot.unmount();
              componentRoot = null;
            }
            if (container !== null) {
              container.remove();
              container = null;
            }
            selectedIndex = 0;
          };

          return {
            onStart: (props) => {
              const rect = props.clientRect?.();
              if (!rect) return;

              currentItems = props.items;
              currentCommand = props.command;

              // Create container and render component
              container = createContainer(rect);
              componentRoot = renderComponent(
                container,
                currentItems,
                currentCommand,
                selectedIndex,
              );
            },
            onUpdate: (props) => {
              const rect = props.clientRect?.();
              if (!rect || !container) return;

              currentItems = props.items;
              currentCommand = props.command;

              // Update position
              const position = calculateMenuPosition(rect);
              container.style.top = `${position.top}px`;
              container.style.left = `${position.left}px`;

              // Update menu content
              if (componentRoot !== null) {
                componentRoot = renderComponent(
                  container,
                  currentItems,
                  currentCommand,
                  selectedIndex,
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
                if (componentRoot !== null && container !== null) {
                  componentRoot = renderComponent(
                    container,
                    currentItems,
                    currentCommand,
                    selectedIndex,
                    componentRoot,
                  );
                }
                return true;
              }
              if (event.key === 'ArrowUp') {
                selectedIndex = Math.max(selectedIndex - 1, 0);
                if (componentRoot !== null && container !== null) {
                  componentRoot = renderComponent(
                    container,
                    currentItems,
                    currentCommand,
                    selectedIndex,
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
