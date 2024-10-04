import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useSetRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from 'twenty-ui';

export const EventFieldDiffValueEffect = ({
  diffArtificialRecordStoreId,
  diffRecord,
  mainObjectMetadataItem,
  fieldMetadataItem,
}: {
  diffArtificialRecordStoreId: string;
  diffRecord: Record<string, any> | undefined;
  mainObjectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
}) => {
  const setEntity = useSetRecoilState(
    recordStoreFamilyState(diffArtificialRecordStoreId),
  );
  const setRecordValue = useSetRecordValue();

  useEffect(() => {
    if (!isDefined(diffRecord)) return;

    const forgedObjectRecord = {
      __typename: mainObjectMetadataItem.nameSingular,
      id: diffArtificialRecordStoreId,
      [fieldMetadataItem.name]: diffRecord,
    };

    setEntity(forgedObjectRecord);
    setRecordValue(forgedObjectRecord.id, forgedObjectRecord);
  }, [
    diffRecord,
    diffArtificialRecordStoreId,
    fieldMetadataItem.name,
    mainObjectMetadataItem.nameSingular,
    setEntity,
    setRecordValue,
  ]);

  return <></>;
};
