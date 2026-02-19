import { defineNavigationMenuItem } from '@/sdk';
import { ALL_RECIPIENTS_VIEW_ID } from '@/cli/__tests__/apps/rich-app/src/views/all-recipients.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'c1a2b3c4-0002-4a7b-8c9d-0e1f2a3b4c5d',
  position: 1,
  viewUniversalIdentifier: ALL_RECIPIENTS_VIEW_ID,
});
