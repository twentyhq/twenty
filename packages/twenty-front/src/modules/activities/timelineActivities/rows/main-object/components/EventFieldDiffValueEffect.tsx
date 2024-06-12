import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

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
  const setEntityFields = useSetRecoilState(
    recordStoreFamilyState(diffArtificialRecordStoreId),
  );

  useEffect(() => {
    if (!diffRecord) return;

    const forgedObjectRecord = {
      __typename: mainObjectMetadataItem.nameSingular,
      id: diffArtificialRecordStoreId,
      [fieldMetadataItem.name]: diffRecord,
    };

    setEntityFields(forgedObjectRecord);
  }, [
    diffRecord,
    diffArtificialRecordStoreId,
    fieldMetadataItem.name,
    mainObjectMetadataItem.nameSingular,
    setEntityFields,
  ]);

  return <></>;
};
