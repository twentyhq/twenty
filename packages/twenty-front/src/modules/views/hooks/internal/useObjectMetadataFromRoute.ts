import { useParams, useSearchParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';

export const useObjectMetadataFromRoute = () => {
  const [searchParams] = useSearchParams();
  const { objectNamePlural = '' } = useParams();
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  return {
    searchParams,
    objectNamePlural,
    objectNameSingular,
    objectMetadataItem,
  };
};
