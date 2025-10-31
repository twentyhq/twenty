import { Extension, type Editor } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
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
import {
  SlashCommandState,
  createClickOutsideListener,
  createScrollListener,
  findDropdownElement,
  handleKeyDown,
  renderComponent,
  updateComponentRoot,
} from './SlashCommandState';

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

type SlashCommandConfig = {
  id: string;
  title: string;
  description: string;
  icon: IconComponent;
  keywords: string[];
  getIsActive: (editor: Editor) => boolean;
  getIsVisible: (editor: Editor) => boolean;
  getOnSelect: (editor: Editor) => () => void;
};

const SLASH_COMMAND_CONFIGS: SlashCommandConfig[] = [
  {
    id: 'paragraph',
    title: 'Text',
    description: 'Plain text paragraph',
    icon: IconPilcrow,
    keywords: ['paragraph', 'text', 'p'],
    getIsActive: (editor) => editor.isActive('paragraph'),
    getIsVisible: (editor) => editor.can().setParagraph?.() ?? true,
    getOnSelect: (editor) => () => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Large section heading',
    icon: IconH1,
    keywords: ['heading', 'h1', 'title'],
    getIsActive: (editor) => editor.isActive('heading', { level: 1 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 1 }) ?? false,
    getOnSelect: (editor) => () =>
      editor.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: IconH2,
    keywords: ['heading', 'h2', 'subtitle'],
    getIsActive: (editor) => editor.isActive('heading', { level: 2 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 2 }) ?? false,
    getOnSelect: (editor) => () =>
      editor.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: IconH3,
    keywords: ['heading', 'h3', 'subheading'],
    getIsActive: (editor) => editor.isActive('heading', { level: 3 }),
    getIsVisible: (editor) => editor.can().setHeading?.({ level: 3 }) ?? false,
    getOnSelect: (editor) => () =>
      editor.chain().focus().setHeading({ level: 3 }).run(),
  },
  {
    id: 'bold',
    title: 'Bold',
    description: 'Make text bold',
    icon: IconBold,
    keywords: ['bold', 'strong', 'b'],
    getIsActive: (editor) => editor.isActive('bold'),
    getIsVisible: (editor) => editor.can().toggleBold?.() ?? false,
    getOnSelect: (editor) => () => editor.chain().focus().toggleBold().run(),
  },
  {
    id: 'italic',
    title: 'Italic',
    description: 'Make text italic',
    icon: IconItalic,
    keywords: ['italic', 'em', 'i'],
    getIsActive: (editor) => editor.isActive('italic'),
    getIsVisible: (editor) => editor.can().toggleItalic?.() ?? false,
    getOnSelect: (editor) => () => editor.chain().focus().toggleItalic().run(),
  },
  {
    id: 'underline',
    title: 'Underline',
    description: 'Underline text',
    icon: IconUnderline,
    keywords: ['underline', 'u'],
    getIsActive: (editor) => editor.isActive('underline'),
    getIsVisible: (editor) => editor.can().toggleUnderline?.() ?? false,
    getOnSelect: (editor) => () =>
      editor.chain().focus().toggleUnderline().run(),
  },
  {
    id: 'strike',
    title: 'Strikethrough',
    description: 'Strike through text',
    icon: IconStrikethrough,
    keywords: ['strikethrough', 'strike', 'del'],
    getIsActive: (editor) => editor.isActive('strike'),
    getIsVisible: (editor) => editor.can().toggleStrike?.() ?? false,
    getOnSelect: (editor) => () => editor.chain().focus().toggleStrike().run(),
  },
];

const createSlashCommandItem = (
  config: SlashCommandConfig,
  editor: Editor,
): SlashCommandItem => ({
  id: config.id,
  title: config.title,
  description: config.description,
  icon: config.icon,
  keywords: config.keywords,
  isActive: () => config.getIsActive(editor),
  isVisible: () => config.getIsVisible(editor),
  onSelect: config.getOnSelect(editor),
});

// Filter items based on visibility
const filterVisibleItems = (items: SlashCommandItem[]): SlashCommandItem[] => {
  return items.filter((item) => item.isVisible?.() ?? true);
};

// Filter items based on search query
const filterByQuery = (
  items: SlashCommandItem[],
  query: string,
): SlashCommandItem[] => {
  if (!query.trim()) {
    return items;
  }

  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((item) => {
    const searchableText =
      `${item.title} ${(item.keywords ?? []).join(' ')}`.toLowerCase();
    return searchableText.includes(normalizedQuery);
  });
};

const buildItems = (editor: Editor, query: string): SlashCommandItem[] => {
  const allItems = SLASH_COMMAND_CONFIGS.map((config) =>
    createSlashCommandItem(config, editor),
  );
  const visibleItems = filterVisibleItems(allItems);
  return filterByQuery(visibleItems, query);
};

const createSlashCommandRenderer = () => {
  const state = new SlashCommandState();

  // Setting up update callback to re-render component when state changes
  state.setUpdateCallback(() => {
    if (state.componentRoot !== null) {
      updateComponentRoot(state);
    }
  });

  return {
    onStart: (props: {
      items: SlashCommandItem[];
      command: (item: SlashCommandItem) => void;
      clientRect?: (() => DOMRect | null) | null;
    }) => {
      const rect = props.clientRect?.();
      if (!rect) {
        return;
      }

      state.setCurrentItems(props.items);
      state.setCurrentCommand(props.command);
      state.setCurrentRect(rect);

      state.scrollListener = createScrollListener(
        state,
        props.clientRect || (() => null),
      );
      state.clickOutsideListener = createClickOutsideListener(state);

      window.addEventListener('scroll', state.scrollListener, true);
      document.addEventListener('mousedown', state.clickOutsideListener);

      renderComponent(state);
      state.dropdownElement = findDropdownElement();
    },
    onUpdate: (props: {
      items: SlashCommandItem[];
      command: (item: SlashCommandItem) => void;
      clientRect?: (() => DOMRect | null) | null;
    }) => {
      const rect = props.clientRect?.();
      if (!rect) {
        return;
      }

      state.setCurrentItems(props.items);
      state.setCurrentCommand(props.command);
      state.setCurrentRect(rect);

      if (state.currentItems.length === 0) {
        state.cleanup();
        return;
      }

      updateComponentRoot(state);
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      return handleKeyDown(props, state);
    },
    onExit: () => {
      state.cleanup();
    },
  };
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
        items: ({ query }) => buildItems(editor, query),
        render: createSlashCommandRenderer,
      }),
    ];
  },
});
