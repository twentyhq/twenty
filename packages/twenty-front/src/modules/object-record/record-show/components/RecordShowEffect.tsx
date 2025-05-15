import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';
import { useSetRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

type RecordShowEffectProps = {
  objectNameSingular: string;
  recordId: string;
};

export const RecordShowEffect = ({
  objectNameSingular,
  recordId,
}: RecordShowEffectProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();
  const setRecordValueInContextSelector = useSetRecordValue();

  const FIND_ONE_RECORD_FOR_SHOW_PAGE_OPERATION_SIGNATURE =
    buildFindOneRecordForShowPageOperationSignature({
      objectMetadataItem,
      objectMetadataItems,
    });

  const { record } = useFindOneRecord({
    objectRecordId: recordId,
    objectNameSingular,
    recordGqlFields: FIND_ONE_RECORD_FOR_SHOW_PAGE_OPERATION_SIGNATURE.fields,
    withSoftDeleted: true,
  });

  const updater = useRecoilCallback(
    ({ snapshot, set }) =>
      async (newRecord: ObjectRecord | null | undefined) => {
        const previousRecordValue = snapshot
          .getLoadable(recordStoreFamilyState(recordId))
          .getValue();

        if (JSON.stringify(previousRecordValue) !== JSON.stringify(newRecord)) {
          set(recordStoreFamilyState(recordId), newRecord);
        }

        setRecordValueInContextSelector(recordId, newRecord);
      },
    [recordId, setRecordValueInContextSelector],
  );

  useEffect(() => {
    updater(record);
  }, [record, updater]);


  return <></>;
};
