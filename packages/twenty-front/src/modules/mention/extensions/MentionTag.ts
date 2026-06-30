import { MentionChip } from '@/mention/components/MentionChip';
import { Node } from '@tiptap/core';
import { mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';

export const MentionTag = Node.create({
  name: 'mentionTag',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes: () => ({
    recordId: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-record-id'),
      renderHTML: (attributes) => ({
        'data-record-id': attributes.recordId,
      }),
    },
    objectNameSingular: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-object-name-singular'),
      renderHTML: (attributes) => ({
        'data-object-name-singular': attributes.objectNameSingular,
      }),
    },
    label: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-label'),
      renderHTML: (attributes) => ({
        'data-label': attributes.label,
      }),
    },
    imageUrl: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-image-url'),
      renderHTML: (attributes) => ({
        'data-image-url': attributes.imageUrl,
      }),
    },
  }),

  renderHTML: ({ node, HTMLAttributes }) => {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'mentionTag',
        class: 'mention-tag',
      }),
      `@${node.attrs.label}`,
    ];
  },

  addNodeView: () => {
    return ReactNodeViewRenderer(MentionChip);
  },

  renderText: ({ node }) => {
    const { objectNameSingular, recordId, label } = node.attrs;

    return `[[record:${objectNameSingular}:${recordId}:${label}]]`;
  },
});
