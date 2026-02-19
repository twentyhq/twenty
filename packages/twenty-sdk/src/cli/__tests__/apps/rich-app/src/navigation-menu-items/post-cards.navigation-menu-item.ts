import { defineNavigationMenuItem } from '@/sdk';
import { ALL_POST_CARDS_VIEW_ID } from '@/cli/__tests__/apps/rich-app/src/views/all-post-cards.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'c1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d',
  position: 0,
  viewUniversalIdentifier: ALL_POST_CARDS_VIEW_ID,
});
