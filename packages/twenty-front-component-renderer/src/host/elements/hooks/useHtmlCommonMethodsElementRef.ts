import { type Ref, useImperativeHandle, useRef, useState } from 'react';

import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';
import { type HtmlCommonMethods } from '@/types/HtmlCommonMethods';

// The remote renderer's ref is how remote element method calls reach the host.
export const useHtmlCommonMethodsElementRef = (
  htmlCommonMethodsRef: Ref<HtmlCommonMethods> | undefined,
): ElementRefCallback => {
  const hostElementRef = useRef<HTMLOrSVGElement | null>(null);

  useImperativeHandle(
    htmlCommonMethodsRef,
    () => ({
      focus: (options) => hostElementRef.current?.focus(options),
      blur: () => hostElementRef.current?.blur(),
    }),
    [],
  );

  const [htmlCommonMethodsElementRef] = useState(
    () => (element: Element | null) => {
      hostElementRef.current = element as HTMLOrSVGElement | null;
    },
  );

  return htmlCommonMethodsElementRef;
};
