import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { FileNodeView } from '@/advanced-text-editor/extensions/file/FileNodeView';
import { type FileNodeOptions } from '@/advanced-text-editor/types/FileNodeOptions';

export const FileNode = Node.create<FileNodeOptions>({
  name: TIPTAP_NODE_TYPES.FILE,
  group: 'block',
  atom: true,
  draggable: true,

  addOptions: () => ({
    onFileUpload: undefined,
    onFileUploadError: undefined,
  }),

  addAttributes: () => ({
    url: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-url') ?? '',
      renderHTML: (attributes) => ({ 'data-url': attributes.url }),
    },
    name: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-name') ?? '',
      renderHTML: (attributes) => ({ 'data-name': attributes.name }),
    },
  }),

  parseHTML: () => [{ tag: 'div[data-type="file"]' }],

  renderHTML: ({ HTMLAttributes }) => [
    'div',
    mergeAttributes(HTMLAttributes, { 'data-type': TIPTAP_NODE_TYPES.FILE }),
  ],

  renderText: ({ node }) => node.attrs.name,

  addNodeView: () => ReactNodeViewRenderer(FileNodeView),
});
