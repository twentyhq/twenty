import {
  defineCommandMenuItem,
  selectedRecords,
  someNonEmptyString,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { OPEN_ROUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/components/open-route-component-effect';

export default defineCommandMenuItem({
  universalIdentifier: 'e92c0e07-2609-4d8b-9c37-ecc5a8ab3564',
  label: 'Open route in Google Maps',
  icon: 'IconRoute',
  availabilityType: 'RECORD_FIELD',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  availabilityFieldUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields.address
      .universalIdentifier,
  // A route needs a destination.
  conditionalAvailabilityExpression: someNonEmptyString(
    selectedRecords,
    'address.addressCity',
  ),
  frontComponentUniversalIdentifier:
    OPEN_ROUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
