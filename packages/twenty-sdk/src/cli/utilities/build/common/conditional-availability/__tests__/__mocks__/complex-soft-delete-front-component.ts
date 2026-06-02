import {
  defineCommandMenuItem,
  none,
  numberOfSelectedRecords,
  objectPermissions,
  selectedRecords,
} from '@/sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'complex-soft-delete-cmd',
  label: 'Complex Soft Delete',
  frontComponentUniversalIdentifier: 'complex-soft-delete',
  conditionalAvailabilityExpression:
    objectPermissions.canSoftDeleteObjectRecords &&
    none(selectedRecords, 'isRemote') &&
    numberOfSelectedRecords > 0,
});
