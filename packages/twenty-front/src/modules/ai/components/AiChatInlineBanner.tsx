import {
  type InlineBannerProps,
  InlineBanner,
} from 'twenty-ui/components/feedback';

type AiChatInlineBannerProps = Pick<InlineBannerProps, 'children' | 'action'>;

export const AiChatInlineBanner = ({
  children,
  action,
}: AiChatInlineBannerProps) => (
  <InlineBanner embedded status="error" action={action}>
    {children}
  </InlineBanner>
);
