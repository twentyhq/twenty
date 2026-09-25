import {
  defineCommandMenuItem,
  numberOfSelectedRecords,
  objectPermissions,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { GENERATE_MEETING_LINK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/components/generate-meeting-link-component-effect';

// Same front component as the Meeting link field button, offered in the
// record menus too.
export default defineCommandMenuItem({
  universalIdentifier: 'a83d6f10-94c2-4b57-b1e8-6f0c3a92d5b4',
  label: 'Add Video Link',
  icon: 'IconVideoPlus',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  conditionalAvailabilityExpression:
    numberOfSelectedRecords === 1 && objectPermissions.canUpdateObjectRecords,
  frontComponentUniversalIdentifier:
    GENERATE_MEETING_LINK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
