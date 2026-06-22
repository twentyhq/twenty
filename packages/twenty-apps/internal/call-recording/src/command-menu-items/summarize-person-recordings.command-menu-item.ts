import {
  SUMMARIZE_PERSON_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
  SUMMARIZE_PERSON_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/summarize-person-recordings-universal-identifiers';
import { defineCommandMenuItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: SUMMARIZE_PERSON_RECORDINGS_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Summarize call recordings',
  icon: 'IconSparkles',
  isPinned: false,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    '20202020-e674-48e5-a542-72570eee7213',
  frontComponentUniversalIdentifier:
    SUMMARIZE_PERSON_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
