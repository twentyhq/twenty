import { defineCommandMenuItem } from 'twenty-sdk/define';
import { CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/class-session.object';
import { TRAINER_COMPENSATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/trainer-compensation.front-component';
export default defineCommandMenuItem({
  universalIdentifier: '0db4a683-8f65-4ce8-8f1b-9138a69cf970',
  label: 'Начислить / исправить оплату тренера',
  shortLabel: 'Оплата тренера',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    TRAINER_COMPENSATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
