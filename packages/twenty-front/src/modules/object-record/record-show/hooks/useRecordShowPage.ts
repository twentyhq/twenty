import { useParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { doNotTranslate, isDefined } from 'twenty-shared/utils';

export const useRecordShowPage = (
  propsObjectNameSingular: string,
  propsObjectRecordId: string,
) => {
  const {
    objectNameSingular: paramObjectNameSingular,
    objectRecordId: paramObjectRecordId,
  } = useParams();

  const objectNameSingular = propsObjectNameSingular ?? paramObjectNameSingular;
  const objectRecordId = propsObjectRecordId ?? paramObjectRecordId;

  if (!isDefined(objectNameSingular) || !isDefined(objectRecordId)) {
    throw new Error(doNotTranslate('Object name or Record id is not defined'));
  }

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  return {
    objectNameSingular,
    objectRecordId,
    objectMetadataItem,
  };
};
