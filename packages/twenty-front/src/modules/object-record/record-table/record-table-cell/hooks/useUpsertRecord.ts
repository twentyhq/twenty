import { useRecoilCallback } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
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

  const upsertRecord = useRecoilCallback(
    ({ snapshot }) =>
      (persistField: () => void, recordId: string, fieldName: string) => {
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

        const recordTablePendingRecordId = getSnapshotValue(
          snapshot,
          recordTablePendingRecordIdState,
        );
        const fieldScopeId = getScopeIdFromComponentId(
          `${recordId}-${fieldName}`,
        );

        const draftValueSelector = extractComponentSelector(
          recordFieldInputDraftValueComponentSelector,
          fieldScopeId,
        );

        const draftValue = getSnapshotValue(snapshot, draftValueSelector());

        if (isDefined(recordTablePendingRecordId) && isDefined(draftValue)) {
          createOneRecord({
            id: recordTablePendingRecordId,
            [labelIdentifierFieldMetadataItem?.name ?? 'name']: draftValue,
            position: 'first',
          });
        } else if (!recordTablePendingRecordId) {
          persistField();
        }
      },
    [createOneRecord, objectNameSingular, recordTablePendingRecordIdState],
  );

  return { upsertRecord };
};
