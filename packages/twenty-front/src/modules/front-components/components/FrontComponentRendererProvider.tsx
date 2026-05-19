import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type FocusEvent, useCallback, useEffect, useMemo } from 'react';

const INPUT_TYPES_WITHOUT_TEXT_ENTRY = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

const isEditableElement = (element: EventTarget | null): boolean => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (element instanceof HTMLTextAreaElement) {
    return !element.disabled;
  }

  if (element instanceof HTMLInputElement) {
    return (
      !element.disabled &&
      !INPUT_TYPES_WITHOUT_TEXT_ENTRY.has(element.type.toLowerCase())
    );
  }

  return element.isContentEditable;
};

type FrontComponentRendererProviderProps = {
  frontComponentId: string;
  children: React.ReactNode;
};

export const FrontComponentRendererProvider = ({
  frontComponentId,
  children,
}: FrontComponentRendererProviderProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const focusId = useMemo(
    () => `front-component-renderer-${frontComponentId}-input`,
    [frontComponentId],
  );

  const pushFrontComponentInputFocusItem = useCallback(() => {
    pushFocusItemToFocusStack({
      focusId,
      component: {
        type: FocusComponentType.TEXT_INPUT,
        instanceId: focusId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  }, [focusId, pushFocusItemToFocusStack]);

  const removeFrontComponentInputFocusItem = useCallback(() => {
    removeFocusItemFromFocusStackById({ focusId });
  }, [focusId, removeFocusItemFromFocusStackById]);

  const handleFocusCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!isEditableElement(event.target)) {
        return;
      }

      pushFrontComponentInputFocusItem();
    },
    [pushFrontComponentInputFocusItem],
  );

  const handleBlurCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!isEditableElement(event.target)) {
        return;
      }

      if (
        event.currentTarget.contains(event.relatedTarget) &&
        isEditableElement(event.relatedTarget)
      ) {
        return;
      }

      removeFrontComponentInputFocusItem();
    },
    [removeFrontComponentInputFocusItem],
  );

  useEffect(() => {
    return () => {
      removeFrontComponentInputFocusItem();
    };
  }, [removeFrontComponentInputFocusItem]);

  return (
    <FrontComponentInstanceContext.Provider
      value={{ instanceId: frontComponentId }}
    >
      <div
        style={{ display: 'contents' }}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
      >
        {children}
      </div>
    </FrontComponentInstanceContext.Provider>
  );
};
