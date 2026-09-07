import { styled } from '@linaria/react';
import { type ComponentProps } from 'react';
import { InlineBanner } from 'twenty-ui/feedback';

const StyledInlineBanner = styled(InlineBanner)`
  margin-bottom: 0;
`;

type AiChatInlineBannerProps = Pick<
  ComponentProps<typeof InlineBanner>,
  'message' | 'button'
>;

export const AiChatInlineBanner = ({
  message,
  button,
}: AiChatInlineBannerProps) => (
  <StyledInlineBanner color="gray" message={message} button={button} />
);
