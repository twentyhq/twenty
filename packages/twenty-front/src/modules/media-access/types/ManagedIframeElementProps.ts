import { type IframeHTMLAttributes } from 'react';
import { type FrontComponentIframeHostProps } from 'twenty-front-component-renderer';

export type ManagedIframeElementProps = Pick<
  IframeHTMLAttributes<HTMLIFrameElement>,
  | 'src'
  | 'srcDoc'
  | 'title'
  | 'className'
  | 'style'
  | 'width'
  | 'height'
  | 'hidden'
  | 'onLoad'
  | 'onError'
  | 'sandbox'
  | 'allow'
  | 'allowFullScreen'
> & {
  renderIframe?: FrontComponentIframeHostProps['renderIframe'];
  iframeElement?: Element | null;
};
