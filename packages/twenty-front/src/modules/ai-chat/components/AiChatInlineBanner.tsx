import {
  type InlineBannerProps,
  InlineBanner,
} from 'twenty-ui/components/feedback';

type AiChatInlineBannerProps = Pick<
  InlineBannerProps,
  'children' | 'action' | 'status'
>;

export const AiChatInlineBanner = ({
  children,
  action,
  status = 'error',
}: AiChatInlineBannerProps) => (
  <InlineBanner embedded status={status} action={action}>
    {children}
  </InlineBanner>
);
