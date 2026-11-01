import { defineCommandMenuItem } from 'twenty-sdk/define';
import { CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/class-session.object';
import { ASSIGN_SESSION_TRAINER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/assign-session-trainer.front-component';
export default defineCommandMenuItem({
  universalIdentifier: '9be21ce2-09fa-49c3-a6e1-5b3e39fced74',
  label: 'Назначить тренера',
  shortLabel: 'Назначить тренера',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    ASSIGN_SESSION_TRAINER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
