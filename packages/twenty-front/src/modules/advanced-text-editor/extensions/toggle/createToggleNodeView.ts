import { t } from '@lingui/core/macro';
import { type NodeViewRendererProps } from '@tiptap/core';
import { type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { type NodeView, type ViewMutationRecord } from '@tiptap/pm/view';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

const getOpenStateStorageKey = (node: ProseMirrorNode) =>
  isNonEmptyString(node.attrs.id) ? `toggle-${node.attrs.id}` : undefined;

const readIsOpen = (node: ProseMirrorNode) => {
  const storageKey = getOpenStateStorageKey(node);

  return (
    isDefined(storageKey) && window.localStorage.getItem(storageKey) === 'true'
  );
};

export const createToggleNodeView = ({
  node: initialNode,
  editor,
  getPos,
}: NodeViewRendererProps): NodeView => {
  let node = initialNode;
  let isOpen = readIsOpen(node);

  const dom = document.createElement('div');
  dom.className = 'toggle-block';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'toggle-block-button';
  toggleButton.contentEditable = 'false';
  toggleButton.setAttribute('aria-label', t`Toggle`);

  const contentDOM = document.createElement('div');
  contentDOM.className = 'toggle-block-content';

  const addBlockButton = document.createElement('button');
  addBlockButton.type = 'button';
  addBlockButton.className = 'toggle-block-add-button';
  addBlockButton.contentEditable = 'false';
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

  const keepEditorFocus = (event: MouseEvent) => event.preventDefault();

  toggleButton.addEventListener('mousedown', keepEditorFocus);
  toggleButton.addEventListener('click', () => setIsOpen(!isOpen));
  addBlockButton.addEventListener('mousedown', keepEditorFocus);
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
