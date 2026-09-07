import { type ComponentProps } from 'react';
import { InlineBanner } from 'twenty-ui/feedback';

type AiChatInlineBannerProps = Pick<
  ComponentProps<typeof InlineBanner>,
  'message' | 'button'
>;

export const AiChatInlineBanner = ({
  message,
  button,
}: AiChatInlineBannerProps) => (
  <InlineBanner embedded color="danger" message={message} button={button} />
);
