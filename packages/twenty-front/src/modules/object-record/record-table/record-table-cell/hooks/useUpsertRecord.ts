import { useRecoilCallback } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { extractComponentSelector } from '@/ui/utilities/state/component-state/utils/extractComponentSelector';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { isDefined } from '~/utils/isDefined';

export const useUpsertRecord = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
  });

  const upsertRecord = useRecoilCallback(
    ({ snapshot }) =>
      (
        persistField: () => void,
        recordId: string,
        fieldName: string,
        recordTableId: string,
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

        const tableScopeId = getScopeIdFromComponentId(recordTableId);

        const recordTablePendingRecordIdState = extractComponentState(
          recordTablePendingRecordIdComponentState,
          tableScopeId,
        );

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
    [createOneRecord, objectNameSingular],
  );

  return { upsertRecord };
};
