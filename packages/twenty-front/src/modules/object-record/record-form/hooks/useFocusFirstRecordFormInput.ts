import { useEffect, useRef } from 'react';

export const useFocusFirstRecordFormInput = (requestId: string) => {
  const formFieldsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      const firstInput = formFieldsRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]):not([readonly]):not([type="hidden"]), textarea:not([disabled]):not([readonly]), [contenteditable="true"]',
      );

      firstInput?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [requestId]);

  return { formFieldsRef };
};
