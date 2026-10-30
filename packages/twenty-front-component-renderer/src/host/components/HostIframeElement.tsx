import { useContext, useState } from 'react';
import {
  getIframeMediaAllow,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { FrontComponentIframeHostContext } from '@/host/elements/contexts/FrontComponentIframeHostContext';
import { useComposedElementRef } from '@/host/elements/hooks/useComposedElementRef';
import { useHtmlHostElementProps } from '@/host/elements/hooks/useHtmlHostElementProps';
import { createPlainHostElement } from '@/host/elements/utils/createPlainHostElement';
import { getIframeHostReactProps } from '@/host/elements/utils/getIframeHostReactProps';
import { getRequestedIframeMediaCapabilities } from '@/host/elements/utils/getRequestedIframeMediaCapabilities';

type HostIframeElementProps = Record<string, unknown>;

export const HostIframeElement = (props: HostIframeElementProps) => {
  const IframeHost = useContext(FrontComponentIframeHostContext);
  const { reactBindableProps, hostEnforcedProps, composedElementRef } =
    useHtmlHostElementProps({ props, htmlTag: 'iframe' });
  const [iframeElement, setIframeElement] = useState<Element | null>(null);
  const managedIframeElementRef = useComposedElementRef([
    composedElementRef,
    setIframeElement,
  ]);
  const iframeProps = getIframeHostReactProps({
    ...reactBindableProps,
    ...hostEnforcedProps,
  });

  if (
    isDefined(IframeHost) &&
    isNonEmptyArray(getRequestedIframeMediaCapabilities(iframeProps.allow))
  ) {
    return (
      <IframeHost
        iframeProps={iframeProps}
        iframeElement={iframeElement}
        renderIframe={({ allow, sandbox }) =>
          createPlainHostElement({
            htmlTag: 'iframe',
            isVoid: false,
            reactBindableProps,
            hostEnforcedProps: {
              ...hostEnforcedProps,
              src: iframeProps.src,
              srcDoc: iframeProps.srcDoc,
              allow,
              sandbox,
            },
            composedElementRef: managedIframeElementRef,
            children: undefined,
          })
        }
      />
    );
  }

  return createPlainHostElement({
    htmlTag: 'iframe',
    isVoid: false,
    reactBindableProps,
    hostEnforcedProps: {
      ...hostEnforcedProps,
      allow: getIframeMediaAllow({ allow: iframeProps.allow }),
    },
    composedElementRef,
    children: undefined,
  });
};
