import { useContext } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilValue } from 'recoil';
import { FieldContext } from '../contexts/FieldContext';
import { isFieldValueReadOnly } from '../utils/isFieldValueReadOnly';

export const useIsFieldValueReadOnly = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  const { metadata, type } = fieldDefinition;

  const recordFromStore = useRecoilValue<ObjectRecord | null>(
    recordStoreFamilyState(recordId),
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: metadata.objectMetadataNameSingular ?? '',
  });

  return isFieldValueReadOnly({
    objectNameSingular: metadata.objectMetadataNameSingular,
    fieldName: metadata.fieldName,
    fieldType: type,
    isObjectRemote: objectMetadataItem.isRemote,
    isRecordDeleted: recordFromStore?.deletedAt,
  });
};
