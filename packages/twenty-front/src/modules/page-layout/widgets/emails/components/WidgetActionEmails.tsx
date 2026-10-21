import { WidgetActionEmailCompose } from '@/page-layout/widgets/emails/components/WidgetActionEmailCompose';
import { WidgetActionEmailLinkThreads } from '@/page-layout/widgets/emails/components/WidgetActionEmailLinkThreads';

export const WidgetActionEmails = () => (
  <>
    <WidgetActionEmailLinkThreads />
    <WidgetActionEmailCompose />
  </>
);
