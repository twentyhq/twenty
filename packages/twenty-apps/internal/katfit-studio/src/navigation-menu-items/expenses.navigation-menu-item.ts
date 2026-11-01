import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { EXPENSE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/expense.object';
export default defineNavigationMenuItem({
  universalIdentifier: 'aa7d1121-ac4e-4cc1-a2a3-9fce1d35a9b9',
  position: 10,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: EXPENSE_OBJECT_UNIVERSAL_IDENTIFIER,
});
