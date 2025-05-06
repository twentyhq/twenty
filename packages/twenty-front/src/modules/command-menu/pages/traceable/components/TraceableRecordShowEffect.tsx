import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type TraceableRecordShowEffectProps = {
  recordId: string;
};

export const TraceableRecordShowEffect = ({
  recordId,
}: TraceableRecordShowEffectProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Traceable,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const FIND_ONE_RECORD_FOR_SHOW_PAGE_OPERATION_SIGNATURE =
    buildFindOneRecordForShowPageOperationSignature({
      objectMetadataItem,
      objectMetadataItems,
    });

  const { record } = useFindOneRecord({
    objectRecordId: recordId,
    objectNameSingular: CoreObjectNameSingular.Traceable,
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
