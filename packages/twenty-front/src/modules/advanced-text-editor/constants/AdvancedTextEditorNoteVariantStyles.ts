import { themeCssVariables } from 'twenty-ui/theme';

// oxlint-disable-next-line twenty/no-hardcoded-colors
export const ADVANCED_TEXT_EDITOR_NOTE_VARIANT_STYLES = `
  --editor-guide-color: light-dark(rgb(207, 207, 207), rgb(127, 127, 127));
  --editor-accent-gray: rgb(125, 121, 122);
  --editor-text-color-gray: light-dark(rgb(155, 154, 151), rgb(190, 189, 184));
  --editor-text-color-brown: light-dark(rgb(100, 71, 58), rgb(142, 101, 82));
  --editor-text-color-red: light-dark(rgb(224, 62, 62), rgb(236, 64, 64));
  --editor-text-color-orange: light-dark(rgb(217, 115, 13), rgb(227, 121, 13));
  --editor-text-color-yellow: rgb(223, 171, 1);
  --editor-text-color-green: light-dark(rgb(77, 100, 97), rgb(107, 139, 135));
  --editor-text-color-blue: light-dark(rgb(11, 110, 153), rgb(14, 135, 188));
  --editor-text-color-purple: light-dark(rgb(105, 64, 165), rgb(133, 82, 215));
  --editor-text-color-pink: light-dark(rgb(173, 26, 114), rgb(218, 32, 143));
  --editor-background-color-gray: light-dark(rgb(235, 236, 237), rgb(155, 154, 151));
  --editor-background-color-brown: light-dark(rgb(233, 229, 227), rgb(100, 71, 58));
  --editor-background-color-red: light-dark(rgb(251, 228, 228), rgb(190, 52, 52));
  --editor-background-color-orange: light-dark(rgb(246, 233, 217), rgb(183, 96, 10));
  --editor-background-color-yellow: light-dark(rgb(251, 243, 219), rgb(181, 139, 0));
  --editor-background-color-green: light-dark(rgb(221, 237, 234), rgb(77, 100, 97));
  --editor-background-color-blue: light-dark(rgb(221, 235, 241), rgb(11, 110, 153));
  --editor-background-color-purple: light-dark(rgb(234, 228, 242), rgb(105, 64, 165));
  --editor-background-color-pink: light-dark(rgb(244, 223, 235), rgb(173, 26, 114));

  .tiptap {
    color: ${themeCssVariables.font.color.primary};
    white-space: pre-wrap;

    p.is-editor-empty:first-of-type:not([data-placeholder=''])::before {
      color: var(--editor-guide-color);
      font-style: italic;
      font-weight: ${themeCssVariables.font.weight.regular};
    }

    :is(p, h1, h2, h3, h4, h5, h6) a {
      color: ${themeCssVariables.color.blue};
    }

    .node-image img {
      border-radius: 4px;
      display: block;
    }

    .node-mentionTag {
      padding: 0 ${themeCssVariables.spacing[1]};

      a {
        box-sizing: border-box;
      }
    }

    code {
      border: 1px solid ${themeCssVariables.font.color.extraLight};
      color: ${themeCssVariables.font.color.danger};
      font-family: monospace;
      padding: 2px ${themeCssVariables.spacing[1]};
    }

    pre {
      background-color: rgb(22, 22, 22);
      border-radius: 8px;
      box-shadow:
        0 -3px 0 rgb(22, 22, 22),
        0 3px 0 rgb(22, 22, 22);
      color: rgb(255, 255, 255);

      code {
        border: none;
        color: inherit;
        font-family: monospace;
        padding: 0;
      }
    }

    blockquote {
      border-left-color: var(--editor-accent-gray);
      color: var(--editor-accent-gray);
      font-style: normal;
    }

    .block-divider {
      border-top-color: var(--editor-accent-gray);
    }

    .block-divider + .block-divider {
      margin-top: calc(
        2 * var(--editor-divider-spacing) - var(--editor-block-spacing)
      );
    }

    ul,
    ol {
      list-style: none;
    }

    ul:not([data-type='taskList']) > li > p:first-child::before,
    ol > li > p:first-child::before {
      left: calc(var(--editor-list-item-offset) - var(--editor-list-indent));
      position: absolute;
      text-align: center;
      top: 0;
      width: calc(var(--editor-list-indent) - 4px);
    }

    ul:not([data-type='taskList']) > li > p:first-child::before {
      content: '•';
    }

    ul:not([data-type='taskList'])
      > li
      > ul:not([data-type='taskList'])
      > li
      > p:first-child::before {
      content: '◦';
    }

    ul:not([data-type='taskList'])
      > li
      ul:not([data-type='taskList'])
      > li
      > ul:not([data-type='taskList'])
      > li
      > p:first-child::before {
      content: '▪︎';
    }

    ol > li > p:first-child::before {
      content: counter(list-item) '.';
    }

    li li {
      position: relative;

      &::before {
        border-left: 1px solid var(--editor-guide-color);
        content: '';
        height: calc(100% + 6px);
        left: calc(-20px - var(--editor-list-indent));
        position: absolute;
        top: -3px;
      }
    }

    li ul[data-type='taskList'] > li::before {
      left: -20px;
    }

    [data-indent] {
      position: relative;

      &::after {
        background-image: repeating-linear-gradient(
          to right,
          transparent 0 4px,
          var(--editor-guide-color) 4px 5px,
          transparent 5px var(--editor-list-indent)
        );
        content: '';
        height: calc(100% + 6px);
        left: calc(-1 * var(--editor-indent) * var(--editor-list-indent));
        position: absolute;
        top: -3px;
        width: calc(var(--editor-indent) * var(--editor-list-indent));
      }
    }

    ul[data-type='taskList'] {
      li > div > p {
        min-height: 24px;
      }

      li > div > :is(ul, ol) {
        margin-top: var(--editor-nested-list-spacing);
      }

      li[data-checked='true'] > div {
        color: inherit;
      }
    }

    .toggle-block {
      align-items: start;
      column-gap: 0;
      grid-template-columns: 24px minmax(0, 1fr);
    }

    .toggle-block[data-open='false'] > .toggle-block-content > :first-child {
      margin-bottom: 0;
    }

    .toggle-block-content > p:first-child {
      padding: 2.25px 0;
    }

    .toggle-block-button {
      border-radius: ${themeCssVariables.border.radius.sm};
      color: light-dark(rgb(63, 63, 63), rgb(207, 207, 207));
      display: flex;
      font-size: inherit;
      height: 24px;
      padding: 3px;
      width: 24px;

      &::before {
        background-color: currentColor;
        border: none;
        height: 18px;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -960 960 960'%3E%3Cpath d='M320-200v-560l440 280-440 280Z'/%3E%3C/svg%3E")
          center / 18px 18px no-repeat;
        width: 18px;
      }
    }

    ${[1, 2, 3, 4, 5, 6]
      .map(
        (level) => `
    .toggle-block:has(> .toggle-block-content > h${level}:first-child)
      > .toggle-block-button {
      margin-top: calc(
        var(--editor-heading-first-spacing-top) +
          (
            var(--editor-heading-${level}-font-size) *
              var(--editor-heading-line-height) - 24px
          ) / 2
      );
    }`,
      )
      .join('\n')}

    .tableWrapper {
      padding: 9px 22px 22px 9px;
    }

    table {
      table-layout: auto;
      width: auto;

      td,
      th {
        border-color: rgb(221, 221, 221);
        min-width: 120px;
        padding: 5px 10px;

        & > p {
          min-height: 1.5rem;
        }
      }

      th {
        background-color: transparent;
        font-weight: 700;
      }
    }
  }
`;
