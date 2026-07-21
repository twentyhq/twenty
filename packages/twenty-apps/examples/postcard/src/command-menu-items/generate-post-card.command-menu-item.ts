import { defineCommandMenuItem } from 'twenty-sdk/define';
import { GENERATE_POST_CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from '../components/generate-post-card-component-effect';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

export default defineCommandMenuItem({
  universalIdentifier: '0f795c1c-8e25-44da-8962-80bef9602ee2',
  label: 'Generate post card content',
  shortLabel: 'Generate content',
  icon: 'IconSparkles',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    GENERATE_POST_CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
