import { defineCommandMenuItem } from 'twenty-sdk/define';
import { CREATE_EXPENSE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/create-expense.front-component';

export default defineCommandMenuItem({
  universalIdentifier: '637e2b04-44b8-4fdc-a647-a8b57068041b',
  label: 'Создать расход',
  shortLabel: 'Создать расход',
  isPinned: true,
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier:
    CREATE_EXPENSE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
