import { type Editor } from '@tiptap/core';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SuggestionMenuAccessibilityEffectProps = {
  editor: Editor;
  menuId: string;
  activeOptionId?: string;
};

const restoreAttributeIfUnchanged = ({
  editorElement,
  attributeName,
  previousValue,
  writtenValue,
}: {
  editorElement: HTMLElement;
  attributeName: string;
  previousValue: string | null;
  writtenValue: string | null;
}) => {
  if (editorElement.getAttribute(attributeName) !== writtenValue) {
    return;
  }

  if (isDefined(previousValue)) {
    editorElement.setAttribute(attributeName, previousValue);
    return;
  }

  editorElement.removeAttribute(attributeName);
};

export const SuggestionMenuAccessibilityEffect = ({
  editor,
  menuId,
  activeOptionId,
}: SuggestionMenuAccessibilityEffectProps) => {
  const writtenActiveOptionElementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const editorElement = editor.view.dom;

    const previousControls = editorElement.getAttribute('aria-controls');
    const previousActiveDescendant = editorElement.getAttribute(
      'aria-activedescendant',
    );

    writtenActiveOptionElementRef.current = null;
    editorElement.setAttribute('aria-controls', menuId);

    return () => {
      if (editorElement.getAttribute('aria-controls') !== menuId) {
        return;
      }

      restoreAttributeIfUnchanged({
        editorElement,
        attributeName: 'aria-controls',
        previousValue: previousControls,
        writtenValue: menuId,
      });
      restoreAttributeIfUnchanged({
        editorElement,
        attributeName: 'aria-activedescendant',
        previousValue: previousActiveDescendant,
        writtenValue: writtenActiveOptionElementRef.current?.id ?? null,
      });
    };
  }, [editor, menuId]);

  useEffect(() => {
    const editorElement = editor.view.dom;

    if (editorElement.getAttribute('aria-controls') !== menuId) {
      return;
    }

    const activeOptionElement = isDefined(activeOptionId)
      ? editorElement.ownerDocument.getElementById(activeOptionId)
      : null;

    writtenActiveOptionElementRef.current = activeOptionElement;

    if (isDefined(activeOptionElement)) {
      editorElement.setAttribute(
        'aria-activedescendant',
        activeOptionElement.id,
      );
      return;
    }

    editorElement.removeAttribute('aria-activedescendant');
  }, [activeOptionId, editor, menuId]);

  return null;
};
