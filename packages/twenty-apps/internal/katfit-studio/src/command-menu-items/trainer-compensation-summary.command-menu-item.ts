import { defineCommandMenuItem } from 'twenty-sdk/define';
import { STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-trainer.object';
import { TRAINER_COMPENSATION_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/trainer-compensation-summary.front-component';
export default defineCommandMenuItem({
  universalIdentifier: '2e7e8f7c-f5a6-43e9-a34d-03d442495b04',
  label: 'Рассчитать зарплату за период',
  shortLabel: 'Зарплата за период',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    TRAINER_COMPENSATION_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
