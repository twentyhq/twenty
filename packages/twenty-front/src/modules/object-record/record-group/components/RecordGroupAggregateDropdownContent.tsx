import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import { getNonReadableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonReadableFieldMetadataIdsFromObjectPermissions';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { RecordGroupAggregateDropdownFieldsContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownFieldsContent';
import { RecordGroupAggregateDropdownMenuContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownMenuContent';
import { RecordGroupAggregateDropdownOptionsContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownOptionsContent';
import { RecordGroupAggregateDropdownContext } from '@/object-record/record-group/states/context/RecordGroupAggregateDropdownContext';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { type AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { getAvailableFieldsIdsForAggregationFromObjectFields } from '@/object-record/utils/getAvailableFieldsIdsForAggregationFromObjectFields';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { t } from '@lingui/core/macro';

export const RecordGroupAggregateDropdownContent = () => {
  const { currentContentId, objectMetadataItem } =
    useDropdownContextStateManagement({
      context: RecordGroupAggregateDropdownContext,
    });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const restrictedFieldMetadataIds =
    getNonReadableFieldMetadataIdsFromObjectPermissions({
      objectPermissions: getObjectPermissionsFromMapByObjectMetadataId({
        objectPermissionsByObjectMetadataId,
        objectMetadataId: objectMetadataItem.id,
      }),
    });

  const readableFields = objectMetadataItem.fields.filter(
    (field) => !restrictedFieldMetadataIds.includes(field.id),
  );

  switch (currentContentId) {
    case 'countAggregateOperationsOptions': {
      const availableAggregations: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields({
          fields: readableFields,
          targetAggregateOperations: COUNT_AGGREGATE_OPERATION_OPTIONS,
        });
      return (
        <RecordGroupAggregateDropdownOptionsContent
          availableAggregations={availableAggregations}
          title={t`Count`}
        />
      );
    }
    case 'percentAggregateOperationsOptions': {
      const availableAggregations: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields({
          fields: readableFields,
          targetAggregateOperations: PERCENT_AGGREGATE_OPERATION_OPTIONS,
        });
      return (
        <RecordGroupAggregateDropdownOptionsContent
          availableAggregations={availableAggregations}
          title={t`Percent`}
        />
      );
    }
    case 'datesAggregateOperationOptions': {
      const datesAvailableAggregations: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields({
          fields: readableFields,
          targetAggregateOperations: [
            DateAggregateOperations.EARLIEST,
            DateAggregateOperations.LATEST,
          ],
        });
      return (
        <RecordGroupAggregateDropdownOptionsContent
          availableAggregations={datesAvailableAggregations}
          title={t`Date`}
        />
      );
    }
    case 'moreAggregateOperationOptions': {
      const availableAggregationsWithoutDates: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields({
          fields: readableFields,
          targetAggregateOperations: NON_STANDARD_AGGREGATE_OPERATION_OPTIONS,
        });
      return (
        <RecordGroupAggregateDropdownOptionsContent
          availableAggregations={availableAggregationsWithoutDates}
          title={t`More options`}
        />
      );
    }
    case 'aggregateFields':
      return <RecordGroupAggregateDropdownFieldsContent />;
    default:
      return <RecordGroupAggregateDropdownMenuContent />;
  }
};
