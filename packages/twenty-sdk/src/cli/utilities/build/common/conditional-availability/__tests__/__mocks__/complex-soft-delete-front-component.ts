import { defineCommandMenuItem } from '@/sdk/define';
import {
  none,
  numberOfSelectedRecords,
  objectPermissions,
  selectedRecords,
} from '@/sdk/front-component';

export default defineCommandMenuItem({
  universalIdentifier: 'complex-soft-delete-cmd',
  label: 'Complex Soft Delete',
  frontComponentUniversalIdentifier: 'complex-soft-delete',
  conditionalAvailabilityExpression:
    objectPermissions.canSoftDeleteObjectRecords &&
    none(selectedRecords, 'isRemote') &&
    numberOfSelectedRecords > 0,
});
