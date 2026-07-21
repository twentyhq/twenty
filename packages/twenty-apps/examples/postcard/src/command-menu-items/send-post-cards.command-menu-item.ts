import { defineCommandMenuItem } from 'twenty-sdk/define';
import { SEND_POST_CARDS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from '../components/send-post-cards-component-effect';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

export default defineCommandMenuItem({
  universalIdentifier: 'bd75de13-87a1-4f7a-94e2-92e19e97523c',
  label: 'Send post cards',
  shortLabel: 'Send',
  icon: 'IconSend',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    SEND_POST_CARDS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
