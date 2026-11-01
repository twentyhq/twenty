import { defineCommandMenuItem } from 'twenty-sdk/define';
import { TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-rate.object';
import { PUBLISH_TRAINER_PAY_RATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/publish-trainer-pay-rate.front-component';
export default defineCommandMenuItem({
  universalIdentifier: '1bdf2934-3be6-48e8-b77c-9e45cbcefd48',
  label: 'Опубликовать тариф тренера',
  shortLabel: 'Опубликовать тариф',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    PUBLISH_TRAINER_PAY_RATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
