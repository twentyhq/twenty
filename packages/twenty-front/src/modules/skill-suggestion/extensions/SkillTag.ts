import { Node } from '@tiptap/core';
import { mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';
import { formatSkillReference } from 'twenty-shared/ai';

import { SkillChip } from '@/skill-suggestion/components/SkillChip';

export const SkillTag = Node.create({
  name: 'skillTag',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes: () => ({
    skillId: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-skill-id'),
      renderHTML: (attributes) => ({
        'data-skill-id': attributes.skillId,
      }),
    },
    name: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-name'),
      renderHTML: (attributes) => ({
        'data-name': attributes.name,
      }),
    },
    label: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-label'),
      renderHTML: (attributes) => ({
        'data-label': attributes.label,
      }),
    },
    icon: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-icon'),
      renderHTML: (attributes) => ({
        'data-icon': attributes.icon,
      }),
    },
  }),

  renderHTML: ({ node, HTMLAttributes }) => {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'skillTag',
        class: 'skill-tag',
      }),
      `/${node.attrs.name}`,
    ];
  },

  addNodeView: () => {
    return ReactNodeViewRenderer(SkillChip);
  },

  renderText: ({ node }) => {
    const { skillId, label } = node.attrs;

    return formatSkillReference({ skillId, label });
  },
});
