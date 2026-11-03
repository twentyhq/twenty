import { type IframeHTMLAttributes, type ReactNode } from 'react';

type FrontComponentIframeHostAttributes = Pick<
  IframeHTMLAttributes<HTMLIFrameElement>,
  'src' | 'srcDoc' | 'hidden' | 'sandbox' | 'allow'
>;

export type FrontComponentIframeHostProps = {
  iframeProps: FrontComponentIframeHostAttributes;
  iframeElement: Element | null;
  renderIframe: (
    options: Pick<FrontComponentIframeHostAttributes, 'allow' | 'sandbox'>,
  ) => ReactNode;
};
