import { defineCommandMenuItem } from 'twenty-sdk/define';
import { EDIT_EXPENSE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/edit-expense.front-component';
import { EXPENSE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/expense.object';

export default defineCommandMenuItem({
  universalIdentifier: '90da50e9-1272-4127-9970-fc6d326782ae',
  label: 'Редактировать расход',
  shortLabel: 'Редактировать расход',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: EXPENSE_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    EDIT_EXPENSE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
