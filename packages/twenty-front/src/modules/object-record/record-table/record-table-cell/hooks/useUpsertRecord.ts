import { useRecoilCallback } from 'recoil';

import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
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

  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const upsertRecord = useRecoilCallback(
    ({ snapshot }) =>
      (
        persistField: () => void,
        entityId: string,
        fieldName: string,
        recordTableId: string,
      ) => {
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
          `${entityId}-${fieldName}`,
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
    [createOneRecord, labelIdentifierFieldMetadataItem],
  );

  return { upsertRecord };
};
