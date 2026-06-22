import {
  SEED_CALL_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
  SEED_CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/seed-call-recordings-universal-identifiers';
import { defineCommandMenuItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: SEED_CALL_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Seed call recordings',
  icon: 'IconDatabase',
  isPinned: false,
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier:
    SEED_CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
