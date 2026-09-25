import {
  defineCommandMenuItem,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { GENERATE_MEETING_LINK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/components/generate-meeting-link-component-effect';
import { MEETING_LINK_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/meeting-link-on-company.field';

export default defineCommandMenuItem({
  universalIdentifier: 'ce1b582e-362a-4ad9-a2c6-b8e25be5c118',
  label: 'Generate meeting link',
  shortLabel: 'Generate',
  icon: 'IconVideoPlus',
  availabilityType: 'RECORD_FIELD',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  availabilityFieldUniversalIdentifier: MEETING_LINK_FIELD_UNIVERSAL_IDENTIFIER,
  // Highlight the button until a link exists; read-only users cannot write it.
  conditionalVariantExpression:
    'not objectPermissions.canUpdateObjectRecords ? "DISABLED" : someNonEmptyString(selectedRecords, "meetingLink.primaryLinkUrl") ? "SECONDARY" : "PRIMARY"',
  frontComponentUniversalIdentifier:
    GENERATE_MEETING_LINK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
