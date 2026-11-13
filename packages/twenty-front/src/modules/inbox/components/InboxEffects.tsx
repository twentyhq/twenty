import { InboxChannelsEffect } from '@/inbox/components/InboxChannelsEffect';
import { InboxThreadInitializationEffect } from '@/inbox/components/InboxThreadInitializationEffect';
import { InboxThreadRecordOperationsEffect } from '@/inbox/components/InboxThreadRecordOperationsEffect';

export const InboxEffects = () => (
  <>
    <InboxThreadInitializationEffect />
    <InboxThreadRecordOperationsEffect />
    <InboxChannelsEffect />
  </>
);
