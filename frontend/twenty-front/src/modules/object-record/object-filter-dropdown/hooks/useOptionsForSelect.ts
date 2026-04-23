import { useParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';

export const DEFAULT_SEARCH_REQUEST_LIMIT = 60;

export const useOptionsForSelect = (fieldMetadataId: string) => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fieldMetadataItem = objectMetadataItem.readableFields.find(
    (field) => field.id === fieldMetadataId,
  );

  const selectOptions = fieldMetadataItem?.options;

  return {
    selectOptions,
  };
};
