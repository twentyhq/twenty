import { AdvancedTextEditorTableHandles } from '@/advanced-text-editor/components/AdvancedTextEditorTableHandles';
import { ImageBubbleMenu } from '@/advanced-text-editor/components/ImageBubbleMenu';
import { LinkBubbleMenu } from '@/advanced-text-editor/components/LinkBubbleMenu';
import { TextBubbleMenu } from '@/advanced-text-editor/components/TextBubbleMenu';
import { useHoveredTableCell } from '@/advanced-text-editor/hooks/useHoveredTableCell';
import { type AdvancedTextEditorComponentProps } from '@/advanced-text-editor/types/AdvancedTextEditorComponentProps';
import { getAdvancedTextEditorTypographyStyle } from '@/advanced-text-editor/utils/getAdvancedTextEditorTypographyStyle';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { FORM_FIELD_PLACEHOLDER_STYLES } from '@/ui/input/constants/FormFieldPlaceholderStyles';
import { styled } from '@linaria/react';
import { EditorContent } from '@tiptap/react';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledEditorContainer = styled.div<{
  readonly?: boolean;
  minHeight: number;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;

  .editor-content {
    flex-grow: 1;
    height: 100%;
    min-height: ${({ minHeight }) => minHeight}px;
    position: relative;
    width: 100%;
  }

  .drop-cursor {
    background-color: ${themeCssVariables.color.blue};
    border-radius: ${themeCssVariables.border.radius.pill};
    pointer-events: none;
    position: absolute;
    transition-duration: calc(
      ${themeCssVariables.animation.duration.fast} * 1s
    );
    transition-property: left, top, width, height;
    transition-timing-function: ease-out;
  }

  .tiptap {
    border: none !important;
    box-sizing: border-box;
    color: ${({ readonly }) =>
      readonly
        ? themeCssVariables.font.color.secondary
        : themeCssVariables.font.color.primary};
    font-family: var(--editor-font-family);
    font-size: var(--editor-font-size);
    font-weight: ${themeCssVariables.font.weight.regular};
    height: 100%;
    line-height: var(--editor-line-height);
    overflow-wrap: anywhere;
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

    p.is-editor-empty:first-of-type:not([data-placeholder=''])::before {
      ${FORM_FIELD_PLACEHOLDER_STYLES}
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    .empty-block-hint {
      position: relative;

      &::before {
        color: ${themeCssVariables.font.color.light};
        content: attr(data-hint);
        left: 0;
        overflow: hidden;
        padding: inherit;
        pointer-events: none;
        position: absolute;
        right: 0;
        text-overflow: ellipsis;
        top: 0;
        white-space: nowrap;
      }
    }

    p {
      margin: 0 0 var(--editor-block-spacing);
    }

    .variable-tag {
      background-color: ${themeCssVariables.color.blue3};
      border-radius: ${themeCssVariables.border.radius.sm};
      color: ${themeCssVariables.color.blue};
      padding: ${themeCssVariables.spacing[1]};
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-weight: var(--editor-heading-font-weight);
      line-height: var(--editor-heading-line-height);
      margin: var(--editor-heading-spacing-top) 0
        var(--editor-heading-spacing-bottom);
    }

    h1 {
      font-size: var(--editor-heading-1-font-size);
    }

    h2 {
      font-size: var(--editor-heading-2-font-size);
    }

    h3 {
      font-size: var(--editor-heading-3-font-size);
    }

    h4 {
      font-size: calc(var(--editor-font-size) * 1.15);
    }

    h5 {
      font-size: var(--editor-font-size);
    }

    h6 {
      font-size: calc(var(--editor-font-size) * 0.9);
    }

    .toggle-block {
      align-items: baseline;
      column-gap: ${themeCssVariables.spacing[1]};
      display: grid;
      grid-template-columns: ${themeCssVariables.spacing[5]} minmax(0, 1fr);
      margin-bottom: var(--editor-block-spacing);
    }

    .toggle-block-button {
      background: none;
      border: none;
      border-radius: ${themeCssVariables.border.radius.sm};
      color: ${themeCssVariables.font.color.tertiary};
      cursor: pointer;
      display: inline-block;
      line-height: var(--editor-line-height);
      padding: 0;

      &::before {
        border-bottom: ${themeCssVariables.spacing[1]} solid transparent;
        border-left: ${themeCssVariables.spacing['1.5']} solid currentColor;
        border-top: ${themeCssVariables.spacing[1]} solid transparent;
        content: '';
        display: inline-block;
        transition: transform
          calc(${themeCssVariables.animation.duration.fast} * 1s);
        vertical-align: middle;
      }

      &:hover {
        background-color: ${themeCssVariables.background.transparent.light};
      }
    }

    .toggle-block[data-open='true'] > .toggle-block-button::before {
      transform: rotate(90deg);
    }

    .toggle-block[data-open='false']
      > .toggle-block-content
      > :not(:first-child) {
      display: none;
    }

    .toggle-block-add-button {
      background: none;
      border: none;
      color: ${themeCssVariables.font.color.light};
      cursor: pointer;
      font: inherit;
      grid-column: 2;
      padding: 0;
      text-align: left;

      &:hover {
        color: ${themeCssVariables.font.color.tertiary};
      }
    }

    ul,
    ol {
      margin: 0 0 var(--editor-block-spacing);
      padding-left: var(--editor-list-indent);
    }

    li {
      --editor-list-item-offset: calc(
        var(--editor-parent-list-offset, 0px) + var(--editor-list-indent)
      );
      margin: 0 0 var(--editor-list-item-spacing);

      &::marker {
        color: var(--editor-list-marker-color);
      }

      & > p {
        margin: 0;
      }

      & > p:first-child {
        margin-left: calc(-1 * var(--editor-list-item-offset));
        padding-left: var(--editor-list-item-offset);
        position: relative;
      }

      & > :is(ul, ol) {
        --editor-parent-list-offset: var(--editor-list-item-offset);
      }
    }

    blockquote {
      border-left: var(--editor-quote-border-width) solid
        var(--editor-accent-color);
      font-style: italic;
      margin: 0 0 var(--editor-block-spacing);
      padding-left: var(--editor-quote-indent);
    }

    .node-image,
    .node-file {
      margin-bottom: var(--editor-block-spacing);
    }

    code {
      background-color: ${themeCssVariables.background.transparent.light};
      border-radius: ${themeCssVariables.border.radius.sm};
      font-family: ${themeCssVariables.code.font.family};
      font-size: 0.9em;
      padding: 0 ${themeCssVariables.spacing[1]};
    }

    pre {
      background-color: ${themeCssVariables.background.transparent.lighter};
      border-radius: ${themeCssVariables.border.radius.md};
      margin: 0 0 var(--editor-block-spacing);
      overflow-x: auto;
      padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

      code {
        background-color: transparent;
        padding: 0;
      }
    }

    ul[data-type='taskList'] {
      list-style: none;
      padding-left: 0;

      li {
        align-items: flex-start;
        display: flex;
        gap: ${themeCssVariables.spacing[2]};

        & > label {
          flex: 0 0 auto;
          user-select: none;
        }

        & > div {
          flex: 1 1 auto;
          min-width: 0;
        }

        & > div > p {
          margin: 0;
        }
      }

      li[data-checked='true'] > div {
        color: ${themeCssVariables.font.color.tertiary};
        text-decoration: line-through;
      }
    }

    .tableWrapper {
      margin: 0 0 var(--editor-block-spacing);
      overflow-x: auto;
      padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]}
        0;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;

      td,
      th {
        border: 1px solid ${themeCssVariables.border.color.medium};
        box-sizing: border-box;
        min-width: 1em;
        padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
        position: relative;
        vertical-align: top;

        & > p {
          margin: 0;
        }
      }

      th {
        background-color: ${themeCssVariables.background.tertiary};
        font-weight: ${themeCssVariables.font.weight.medium};
        text-align: left;
      }

      .selectedCell::after {
        background-color: ${themeCssVariables.color.blue3};
        content: '';
        inset: 0;
        mix-blend-mode: multiply;
        pointer-events: none;
        position: absolute;
      }

      .column-resize-handle {
        background-color: ${themeCssVariables.color.blue};
        bottom: 0;
        pointer-events: none;
        position: absolute;
        right: calc(-1 * ${themeCssVariables.spacing['0.5']});
        top: 0;
        width: ${themeCssVariables.spacing[1]};
      }
    }

    &.resize-cursor {
      cursor: col-resize;
    }

    .block-section {
      border-radius: ${themeCssVariables.border.radius.sm};
      box-sizing: border-box;
      margin-bottom: var(--editor-block-spacing);
      outline: 1px dashed transparent;
      outline-offset: 2px;

      &:hover {
        outline-color: ${themeCssVariables.border.color.strong};
      }

      &.ProseMirror-selectednode {
        background-color: ${themeCssVariables.color.blue3};
        outline: 1px dashed ${themeCssVariables.border.color.strong};
      }
    }

    .block-columns {
      border-radius: ${themeCssVariables.border.radius.sm};
      box-sizing: border-box;
      display: flex;
      gap: ${themeCssVariables.spacing[2]};
      margin-bottom: var(--editor-block-spacing);

      &.ProseMirror-selectednode {
        background-color: ${themeCssVariables.color.blue3};
        outline: none;
      }
    }

    .block-column {
      border-radius: ${themeCssVariables.border.radius.sm};
      box-sizing: border-box;
      flex: 1;
      min-width: 0;
      outline: 1px dashed transparent;
      outline-offset: 2px;
    }

    .block-columns:hover .block-column,
    .block-columns.ProseMirror-selectednode .block-column {
      outline-color: ${themeCssVariables.border.color.strong};
    }

    .block-button-wrapper {
      margin-bottom: var(--editor-block-spacing);

      &.ProseMirror-selectednode {
        background-color: ${themeCssVariables.color.blue3};
        outline: none;
      }
    }

    .block-button {
      box-sizing: border-box;
      cursor: text;
      width: fit-content;
    }

    .block-divider {
      border-bottom: none;
      border-left: none;
      border-right: none;
      border-top: 1px solid ${themeCssVariables.border.color.medium};

      &.ProseMirror-selectednode {
        box-shadow: 0 0 0 ${themeCssVariables.spacing[2]}
          ${themeCssVariables.color.blue3};
        outline: none;
      }
    }

    .ProseMirror-selectednode {
      outline: 2px solid ${themeCssVariables.color.blue};
    }

    :is(
      p,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      ul,
      ol,
      li,
      blockquote,
      .toggle-block
    ).ProseMirror-selectednode {
      background-color: ${themeCssVariables.color.blue3};
      outline: none;
    }

    .block-column.ProseMirror-selectednode {
      background-color: ${themeCssVariables.color.blue3};
      outline: 1px dashed ${themeCssVariables.border.color.strong};
    }

    :is(.node-image, .node-html).ProseMirror-selectednode {
      outline: none;
      position: relative;

      &::after {
        background-color: ${themeCssVariables.color.blue3};
        content: '';
        inset: 0;
        mix-blend-mode: multiply;
        pointer-events: none;
        position: absolute;
      }
    }

    :is(h1, h2, h3, h4, h5, h6):first-child {
      margin-top: 0;
    }

    :is(
      p,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      ul,
      ol,
      li,
      blockquote,
      .toggle-block,
      .node-image,
      .block-section,
      .block-columns,
      .block-button-wrapper
    ):last-child {
      margin-bottom: 0;
    }
  }

  .ProseMirror-focused {
    outline: none;
  }

  .ProseMirror-hideselection * {
    caret-color: transparent;
  }
`;

const TEXT_BUBBLE_MENU_EXTENSION_NAMES = [
  'bold',
  'italic',
  'underline',
  'strike',
  'bulletList',
  'orderedList',
  'heading',
  'link',
];

type AdvancedTextEditorProps = AdvancedTextEditorComponentProps;

export const AdvancedTextEditor = ({
  readonly,
  editor,
  minHeight,
  variant,
}: AdvancedTextEditorProps) => {
  const hasTextBubbleMenu = TEXT_BUBBLE_MENU_EXTENSION_NAMES.some(
    (extensionName) => hasEditorExtension(editor, extensionName),
  );
  const {
    hoveredTableCell,
    handleMouseMove,
    handleMouseLeave,
    handleTableMenuOpenChange,
    clearHoveredTableCell,
  } = useHoveredTableCell({
    editor,
    isEnabled: !readonly && hasEditorExtension(editor, TIPTAP_NODE_TYPES.TABLE),
  });

  return (
    <StyledEditorContainer
      readonly={readonly}
      minHeight={minHeight}
      style={getAdvancedTextEditorTypographyStyle(variant)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <EditorContent className="editor-content" editor={editor} />
      {isDefined(hoveredTableCell) && (
        <AdvancedTextEditorTableHandles
          editor={editor}
          hoveredTableCell={hoveredTableCell}
          onMenuOpenChange={handleTableMenuOpenChange}
          onCellCommandRun={clearHoveredTableCell}
        />
      )}
      {hasEditorExtension(editor, 'image') &&
        !hasEditorExtension(editor, 'section') && (
          <ImageBubbleMenu editor={editor} />
        )}
      {hasTextBubbleMenu && <TextBubbleMenu editor={editor} />}
      {hasEditorExtension(editor, 'link') && <LinkBubbleMenu editor={editor} />}
    </StyledEditorContainer>
  );
};
