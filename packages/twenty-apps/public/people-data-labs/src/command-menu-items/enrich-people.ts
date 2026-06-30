import { defineCommandMenuItem, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import {
  PDL_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
  PDL_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: PDL_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.enrichPeople,
  availabilityObjectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  frontComponentUniversalIdentifier:
  PDL_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.enrichPeople,
  label: 'Enrich people',
  availabilityType: 'RECORD_SELECTION',
});
