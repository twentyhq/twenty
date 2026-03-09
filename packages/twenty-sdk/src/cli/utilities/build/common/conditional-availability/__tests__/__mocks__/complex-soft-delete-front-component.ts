import {
  defineFrontComponent,
  none,
  numberOfSelectedRecords,
  objectPermissions,
  selectedRecords,
} from '@/sdk';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'complex-soft-delete',
  component: MyComponent,
  command: {
    universalIdentifier: 'complex-soft-delete-cmd',
    label: 'Complex Soft Delete',
    conditionalAvailabilityExpression:
      objectPermissions.canSoftDeleteObjectRecords &&
      none(selectedRecords, 'isRemote') &&
      numberOfSelectedRecords > 0,
  },
});
