import { defineFrontComponent } from 'twenty-sdk/define';

import { ResendSyncStatus } from '@modules/resend/manual-sync/components/ResendSyncStatus';
import { RESEND_SYNC_STATUS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';

export default defineFrontComponent({
  universalIdentifier: RESEND_SYNC_STATUS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Resend sync status',
  description:
    'Displays the latest run timestamp, status, and error for each Resend sync step',
  component: ResendSyncStatus,
});
