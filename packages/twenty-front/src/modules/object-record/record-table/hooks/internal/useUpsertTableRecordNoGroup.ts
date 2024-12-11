import { useRecoilCallback } from 'recoil';

import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { extractComponentSelector } from '@/ui/utilities/state/component-state/utils/extractComponentSelector';
import { isDefined } from '~/utils/isDefined';

export const useUpsertTableRecordNoGroup = () => {
  const { objectMetadataItem, objectNameSingular, recordTableId } =
    useRecordTableContextOrThrow();

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
  });

  const recordTablePendingRecordIdState = useRecoilComponentCallbackStateV2(
    recordTablePendingRecordIdComponentState,
    recordTableId,
  );

  const upsertTableRecordNoGroup = useRecoilCallback(
    ({ snapshot }) =>
      (persistField: () => void, recordId: string, fieldName: string) => {
        const labelIdentifierFieldMetadataItem =
          getLabelIdentifierFieldMetadataItem(objectMetadataItem);

        const fieldScopeId = getScopeIdFromComponentId(
          `${recordId}-${fieldName}`,
        );

        const draftValueSelector = extractComponentSelector(
          recordFieldInputDraftValueComponentSelector,
          fieldScopeId,
        );

        const draftValue = getSnapshotValue(snapshot, draftValueSelector());

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
      },
    [createOneRecord, objectMetadataItem, recordTablePendingRecordIdState],
  );

  return { upsertTableRecordNoGroup };
};
