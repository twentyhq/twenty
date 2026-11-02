import { type IframeHTMLAttributes } from 'react';

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
>;
