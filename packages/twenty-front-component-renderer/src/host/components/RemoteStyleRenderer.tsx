import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { wrapCssInTwentyUiCascadeLayer } from '@/host/utils/wrapCssInTwentyUiCascadeLayer';

type RemoteStyleRendererProps = {
  cssText?: string;
  styleKey?: string;
};

// oxlint-disable-next-line twenty/effect-components
export const RemoteStyleRenderer = ({
  cssText,
  styleKey,
}: RemoteStyleRendererProps) => {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-remote-style', styleKey ?? '');
    document.head.appendChild(styleElement);
    styleRef.current = styleElement;

    return () => {
      document.head.removeChild(styleElement);
      styleRef.current = null;
    };
  }, [styleKey]);

  useEffect(() => {
    if (isDefined(styleRef.current) && isDefined(cssText)) {
      styleRef.current.textContent = wrapCssInTwentyUiCascadeLayer(cssText);
    }
  }, [cssText]);

  return null;
};
