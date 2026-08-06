import {
  createColumnBlockContent,
  createParagraphBlockContent,
} from '@/advanced-text-editor/constants/AdvancedTextEditorBlockContent';
import { getAdvancedTextEditorContainerAppearanceSettings } from '@/advanced-text-editor/constants/getAdvancedTextEditorContainerAppearanceSettings';
import { getAdvancedTextEditorTypographySettings } from '@/advanced-text-editor/constants/getAdvancedTextEditorTypographySettings';
import { ButtonNode } from '@/advanced-text-editor/extensions/blocks/ButtonNode';
import { ColumnNode } from '@/advanced-text-editor/extensions/blocks/ColumnNode';
import { ColumnsNode } from '@/advanced-text-editor/extensions/blocks/ColumnsNode';
import { DividerNode } from '@/advanced-text-editor/extensions/blocks/DividerNode';
import { HtmlNode } from '@/advanced-text-editor/extensions/blocks/HtmlNode';
import { SectionNode } from '@/advanced-text-editor/extensions/blocks/SectionNode';
import {
  type AdvancedTextEditorBlockDefinition,
  type AdvancedTextEditorBlockNodeType,
} from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { msg } from '@lingui/core/macro';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import {
  IconBox,
  IconClick,
  IconCode,
  IconColumns,
  IconMinus,
  IconPhoto,
} from 'twenty-ui/icon';

export const ADVANCED_TEXT_EDITOR_BLOCK_CATALOG = {
  [TIPTAP_NODE_TYPES.SECTION]: {
    label: msg`Section`,
    icon: IconBox,
    extension: SectionNode,
    insertionRecipes: [
      {
        id: 'section',
        nodeType: TIPTAP_NODE_TYPES.SECTION,
        title: msg`Section`,
        description: msg`Styled container for document content`,
        keywords: [msg`section`, msg`container`, msg`block`, msg`background`],
        createContent: () => ({
          type: TIPTAP_NODE_TYPES.SECTION,
          content: [createParagraphBlockContent()],
        }),
      },
    ],
    settingsFields: [
      ...getAdvancedTextEditorTypographySettings(),
      ...getAdvancedTextEditorContainerAppearanceSettings(),
    ],
  },
  [TIPTAP_NODE_TYPES.COLUMNS]: {
    label: msg`Columns`,
    icon: IconColumns,
    extension: ColumnsNode,
    insertionRecipes: [
      {
        id: 'columns2',
        nodeType: TIPTAP_NODE_TYPES.COLUMNS,
        title: msg`2 Columns`,
        description: msg`Two columns side by side`,
        keywords: [msg`columns`, msg`two`, msg`layout`, msg`row`],
        createContent: () => ({
          type: TIPTAP_NODE_TYPES.COLUMNS,
          content: [createColumnBlockContent(), createColumnBlockContent()],
        }),
      },
      {
        id: 'columns3',
        nodeType: TIPTAP_NODE_TYPES.COLUMNS,
        title: msg`3 Columns`,
        description: msg`Three columns side by side`,
        keywords: [msg`columns`, msg`three`, msg`layout`, msg`row`],
        createContent: () => ({
          type: TIPTAP_NODE_TYPES.COLUMNS,
          content: [
            createColumnBlockContent(),
            createColumnBlockContent(),
            createColumnBlockContent(),
          ],
        }),
      },
    ],
    settingsFields: [
      ...getAdvancedTextEditorTypographySettings(),
      ...getAdvancedTextEditorContainerAppearanceSettings(),
    ],
  },
  [TIPTAP_NODE_TYPES.COLUMN]: {
    label: msg`Column`,
    icon: IconColumns,
    extension: ColumnNode,
    insertionRecipes: [],
    settingsFields: [
      ...getAdvancedTextEditorTypographySettings(),
      {
        label: msg`Width`,
        kind: 'style',
        property: 'width',
        input: 'size',
        placeholder: '50%',
      },
      ...getAdvancedTextEditorContainerAppearanceSettings(),
    ],
  },
  [TIPTAP_NODE_TYPES.BUTTON]: {
    label: msg`Button`,
    icon: IconClick,
    extension: ButtonNode,
    insertionRecipes: [
      {
        id: 'button',
        nodeType: TIPTAP_NODE_TYPES.BUTTON,
        title: msg`Button`,
        description: msg`Call-to-action button`,
        keywords: [msg`button`, msg`cta`, msg`link`, msg`action`],
        createContent: (translate) => ({
          type: TIPTAP_NODE_TYPES.BUTTON,
          content: [
            {
              type: TIPTAP_NODE_TYPES.TEXT,
              text: translate(msg`Click here`),
            },
          ],
        }),
      },
    ],
    settingsFields: [
      {
        label: msg`Alignment`,
        kind: 'attribute',
        property: 'align',
        input: 'alignment',
      },
      {
        label: msg`Link URL`,
        kind: 'attribute',
        property: 'href',
        input: 'text',
        placeholder: 'https://',
      },
      {
        label: msg`Background`,
        kind: 'style',
        property: 'backgroundColor',
        input: 'color',
      },
      {
        label: msg`Text color`,
        kind: 'style',
        property: 'color',
        input: 'color',
      },
      {
        label: msg`Padding`,
        kind: 'style',
        property: 'padding',
        input: 'box',
        placeholder: '10',
      },
      {
        label: msg`Corner radius`,
        kind: 'style',
        property: 'borderRadius',
        input: 'box',
        placeholder: '6',
      },
    ],
  },
  [TIPTAP_NODE_TYPES.DIVIDER]: {
    label: msg`Divider`,
    icon: IconMinus,
    extension: DividerNode,
    insertionRecipes: [
      {
        id: 'divider',
        nodeType: TIPTAP_NODE_TYPES.DIVIDER,
        title: msg`Divider`,
        description: msg`Horizontal separator line`,
        keywords: [msg`divider`, msg`separator`, msg`line`, msg`hr`],
        createContent: () => ({ type: TIPTAP_NODE_TYPES.DIVIDER }),
      },
    ],
    settingsFields: [
      {
        label: msg`Thickness`,
        kind: 'style',
        property: 'borderTopWidth',
        input: 'size',
        placeholder: '1',
      },
      {
        label: msg`Color`,
        kind: 'style',
        property: 'borderTopColor',
        input: 'color',
      },
      {
        label: msg`Margin`,
        kind: 'style',
        property: 'margin',
        input: 'box',
        placeholder: '16',
      },
    ],
  },
  [TIPTAP_NODE_TYPES.HTML]: {
    label: msg`HTML`,
    icon: IconCode,
    extension: HtmlNode,
    insertionRecipes: [
      {
        id: 'html',
        nodeType: TIPTAP_NODE_TYPES.HTML,
        title: msg`HTML`,
        description: msg`Raw HTML embedded in the document`,
        keywords: [msg`html`, msg`embed`, msg`code`, msg`custom`],
        createContent: () => ({ type: TIPTAP_NODE_TYPES.HTML }),
      },
    ],
    settingsFields: [
      {
        label: msg`HTML`,
        kind: 'attribute',
        property: 'html',
        input: 'textarea',
        placeholder: '<p>Hello</p>',
      },
    ],
  },
  [TIPTAP_NODE_TYPES.IMAGE]: {
    label: msg`Image`,
    icon: IconPhoto,
    extension: null,
    insertionRecipes: [],
    settingsFields: [
      {
        label: msg`Alignment`,
        kind: 'attribute',
        property: 'align',
        input: 'alignment',
      },
      {
        label: msg`Link URL`,
        kind: 'attribute',
        property: 'href',
        input: 'text',
        placeholder: 'https://',
      },
      {
        label: msg`Source`,
        kind: 'attribute',
        property: 'src',
        input: 'text',
        placeholder: 'https://',
      },
      {
        label: msg`Alt text`,
        kind: 'attribute',
        property: 'alt',
        input: 'text',
      },
      {
        label: msg`Width`,
        kind: 'attribute',
        property: 'width',
        input: 'text',
        placeholder: 'auto',
      },
    ],
  },
} as const satisfies Record<
  AdvancedTextEditorBlockNodeType,
  AdvancedTextEditorBlockDefinition
>;
