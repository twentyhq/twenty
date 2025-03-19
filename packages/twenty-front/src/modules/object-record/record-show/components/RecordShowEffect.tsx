import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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

  const [recordFromStore, setRecordFromStore] = useRecoilState(
    recordStoreFamilyState(recordId),
  );

  useEffect(() => {
    if (isDefined(record) && !isDeeplyEqual(record, recordFromStore)) {
      setRecordFromStore(record);
    }
  }, [record, recordFromStore, setRecordFromStore]);

  return <></>;
};
