import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from 'twenty-shared/utils';

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

  useEffect(() => {
    if (!isDefined(diffRecord)) return;

    const forgedObjectRecord = {
      __typename: mainObjectMetadataItem.nameSingular,
      id: diffArtificialRecordStoreId,
      [fieldMetadataItem.name]: diffRecord,
    };

    setEntity(forgedObjectRecord);
  }, [
    diffRecord,
    diffArtificialRecordStoreId,
    fieldMetadataItem.name,
    mainObjectMetadataItem.nameSingular,
    setEntity,
  ]);

  return <></>;
};
