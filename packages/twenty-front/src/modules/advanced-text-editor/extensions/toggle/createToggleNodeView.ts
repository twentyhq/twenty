import { t } from '@lingui/core/macro';
import { type NodeViewRendererProps } from '@tiptap/core';
import { type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { type NodeView, type ViewMutationRecord } from '@tiptap/pm/view';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

const getOpenStateStorageKey = (node: ProseMirrorNode) =>
  isNonEmptyString(node.attrs.id) ? `toggle-${node.attrs.id}` : undefined;

const createButton = (className: string) => {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = className;
  button.contentEditable = 'false';
  button.addEventListener('mousedown', (event) => event.preventDefault());

  return button;
};

export const createToggleNodeView = ({
  node: initialNode,
  editor,
  getPos,
}: NodeViewRendererProps): NodeView => {
  let node = initialNode;
  const initialStorageKey = getOpenStateStorageKey(node);
  let isOpen =
    isDefined(initialStorageKey) &&
    window.localStorage.getItem(initialStorageKey) === 'true';

  const dom = document.createElement('div');
  dom.className = 'toggle-block';

  const toggleButton = createButton('toggle-block-button');
  toggleButton.setAttribute('aria-label', t`Toggle`);

  const contentDOM = document.createElement('div');
  contentDOM.className = 'toggle-block-content';

  const addBlockButton = createButton('toggle-block-add-button');
  addBlockButton.textContent = t`Empty toggle. Click to add a block.`;

  dom.append(toggleButton, contentDOM);

  const render = () => {
    const indent = Number(node.attrs.indent);

    dom.dataset.open = String(isOpen);
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    dom.style.marginLeft =
      indent > 0 ? `calc(${indent} * var(--editor-list-indent))` : '';

    if (isOpen && node.childCount === 1 && editor.isEditable) {
      dom.append(addBlockButton);
    } else {
      addBlockButton.remove();
    }
  };

  const setIsOpen = (nextIsOpen: boolean) => {
    const storageKey = getOpenStateStorageKey(node);

    isOpen = nextIsOpen;

    if (isDefined(storageKey)) {
      window.localStorage.setItem(storageKey, String(nextIsOpen));
    }

    render();
  };

  toggleButton.addEventListener('click', () => setIsOpen(!isOpen));
  addBlockButton.addEventListener('click', () => {
    const position = getPos();

    if (!isDefined(position)) {
      return;
    }

    const insertPosition = position + node.nodeSize - 1;

    editor
      .chain()
      .insertContentAt(insertPosition, { type: TIPTAP_NODE_TYPES.PARAGRAPH })
      .setTextSelection(insertPosition + 1)
      .focus()
      .run();
  });

  render();

  return {
    dom,
    contentDOM,
    update: (updatedNode) => {
      if (updatedNode.type !== node.type) {
        return false;
      }

      const previousChildCount = node.childCount;

      node = updatedNode;

      if (updatedNode.childCount > previousChildCount && !isOpen) {
        setIsOpen(true);
      } else if (updatedNode.childCount === 1 && previousChildCount > 1) {
        setIsOpen(false);
      } else {
        render();
      }

      return true;
    },
    ignoreMutation: (mutation: ViewMutationRecord) =>
      mutation.type !== 'selection' && !contentDOM.contains(mutation.target),
  };
};
