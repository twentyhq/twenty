import { useSearchParams } from 'react-router-dom';

import { useApplicationContentFilters } from '@/settings/applications/hooks/useApplicationContentFilters';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { getApplicationContentListFilterState } from '@/settings/applications/utils/getApplicationContentListFilterState';

export const useApplicationContentListFilters = ({
  contentType,
  content,
}: {
  contentType: ApplicationContentType;
  content: ApplicationContent;
}) => {
  const filters = useApplicationContentFilters({ contentType, content });
  const [searchParams] = useSearchParams();

  return getApplicationContentListFilterState({ filters, searchParams });
};
