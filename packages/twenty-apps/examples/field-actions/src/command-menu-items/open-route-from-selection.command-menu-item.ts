import {
  defineCommandMenuItem,
  numberOfSelectedRecords,
  selectedRecords,
  someNonEmptyString,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { OPEN_ROUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/components/open-route-component-effect';

// Same front component as the Address field button, offered in the record
// menus too.
export default defineCommandMenuItem({
  universalIdentifier: '5c1f8e2a-7b3d-4e9a-8f61-2d4b9c0a7e13',
  label: 'Open Route',
  icon: 'IconRoute',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  conditionalAvailabilityExpression:
    numberOfSelectedRecords === 1 &&
    someNonEmptyString(selectedRecords, 'address.addressCity'),
  frontComponentUniversalIdentifier:
    OPEN_ROUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
