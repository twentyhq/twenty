import {
  type InlineBannerProps,
  InlineBanner,
} from 'twenty-ui/components/feedback';

type InboxInlineBannerProps = Pick<
  InlineBannerProps,
  'children' | 'action' | 'status'
>;

export const InboxInlineBanner = ({
  children,
  action,
  status = 'error',
}: InboxInlineBannerProps) => (
  <InlineBanner embedded status={status} action={action}>
    {children}
  </InlineBanner>
);
