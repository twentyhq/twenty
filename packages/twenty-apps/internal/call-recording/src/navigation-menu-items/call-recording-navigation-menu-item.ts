import { CALL_RECORDING_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/call-recording-view';
import { defineNavigationMenuItem } from 'twenty-sdk';

export default defineNavigationMenuItem({
  universalIdentifier: '5248a62d-7d2e-43a7-ba45-6e8f61876a71',
  name: 'Call recordings',
  icon: 'IconPhone',
  position: 0,
  viewUniversalIdentifier: CALL_RECORDING_VIEW_UNIVERSAL_IDENTIFIER,
});
