import { useRecoilCallback } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordTablePendingRecordIdByGroupComponentFamilyState } from '@/object-record/record-table/states/recordTablePendingRecordIdByGroupComponentFamilyState';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { extractComponentSelector } from '@/ui/utilities/state/component-state/utils/extractComponentSelector';
import { isDefined } from '~/utils/isDefined';

export const useUpsertRecord = ({
  objectNameSingular,
  recordTableId,
}: {
  objectNameSingular: string;
  recordTableId: string;
}) => {
  const hasRecordGroups = useRecoilComponentValueV2(
    hasRecordGroupsComponentSelector,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
    shouldMatchRootQueryFilter: hasRecordGroups,
  });

  const recordTablePendingRecordIdState = useRecoilComponentCallbackStateV2(
    recordTablePendingRecordIdComponentState,
    recordTableId,
  );

  const recordTablePendingRecordIdByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordTablePendingRecordIdByGroupComponentFamilyState,
    );

  const upsertRecord = useRecoilCallback(
    ({ snapshot }) =>
      (
        persistField: () => void,
        recordId: string,
        recordGroupId: string | undefined,
        fieldName: string,
      ) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const foundObjectMetadataItem = objectMetadataItems.find(
          (item) => item.nameSingular === objectNameSingular,
        );

        if (!foundObjectMetadataItem) {
          throw new Error('Object metadata item cannot be found');
        }

        const labelIdentifierFieldMetadataItem =
          getLabelIdentifierFieldMetadataItem(foundObjectMetadataItem);

        const fieldScopeId = getScopeIdFromComponentId(
          `${recordId}-${fieldName}`,
        );

        const draftValueSelector = extractComponentSelector(
          recordFieldInputDraftValueComponentSelector,
          fieldScopeId,
        );

        const draftValue = getSnapshotValue(snapshot, draftValueSelector());

        if (!isDefined(recordGroupId)) {
          // We're not in a record group
          const recordTablePendingRecordId = getSnapshotValue(
            snapshot,
            recordTablePendingRecordIdState,
          );

          if (isDefined(recordTablePendingRecordId) && isDefined(draftValue)) {
            createOneRecord({
              id: recordTablePendingRecordId,
              [labelIdentifierFieldMetadataItem?.name ?? 'name']: draftValue,
              position: 'first',
            });
          } else if (!recordTablePendingRecordId) {
            persistField();
          }
        } else {
          // We're in a record group
          const recordTablePendingRecordId = getSnapshotValue(
            snapshot,
            recordTablePendingRecordIdByGroupFamilyState(recordGroupId),
          );

          const recordGroupDefinition = getSnapshotValue(
            snapshot,
            recordGroupDefinitionFamilyState(recordGroupId),
          );

          const recordGroupFieldMetadataItem =
            foundObjectMetadataItem.fields.find(
              (fieldMetadata) =>
                fieldMetadata.id === recordGroupDefinition?.fieldMetadataId,
            );

          if (
            isDefined(recordTablePendingRecordId) &&
            isDefined(recordGroupDefinition) &&
            isDefined(recordGroupFieldMetadataItem) &&
            isDefined(draftValue)
          ) {
            createOneRecord({
              id: recordTablePendingRecordId,
              [labelIdentifierFieldMetadataItem?.name ?? 'name']: draftValue,
              [recordGroupFieldMetadataItem.name]: recordGroupDefinition.value,
              position: 'first',
            });
          } else if (!recordTablePendingRecordId) {
            persistField();
          }
        }
      },
    [
      createOneRecord,
      objectNameSingular,
      recordTablePendingRecordIdByGroupFamilyState,
      recordTablePendingRecordIdState,
    ],
  );

  return { upsertRecord };
};
