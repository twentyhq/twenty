import { type RefObject, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const FOCUSABLE_FIELD_SELECTOR = [
  'input:not([disabled]):not([readonly]):not([type="hidden"])',
  'textarea:not([disabled]):not([readonly])',
  '[contenteditable="true"]',
  '[tabindex="0"]:not([aria-disabled="true"])',
].join(', ');

type RecordCreationFormFocusEffectProps = {
  requestId: string;
  fieldCount: number;
  formFieldsRef: RefObject<HTMLDivElement | null>;
};

export const RecordCreationFormFocusEffect = ({
  requestId,
  fieldCount,
  formFieldsRef,
}: RecordCreationFormFocusEffectProps) => {
  const [focusedRequestId, setFocusedRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (focusedRequestId === requestId) {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      const firstField = formFieldsRef.current?.querySelector<HTMLElement>(
        FOCUSABLE_FIELD_SELECTOR,
      );

      if (!isDefined(firstField)) {
        return;
      }

      firstField.focus({ preventScroll: true });
      setFocusedRequestId(requestId);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [requestId, fieldCount, focusedRequestId, formFieldsRef]);

  return null;
};
