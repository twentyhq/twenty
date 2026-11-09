import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { getApplicationContentFilters } from '@/settings/applications/utils/getApplicationContentFilters';

export const useApplicationContentFilters = ({
  contentType,
  content,
}: {
  contentType: ApplicationContentType;
  content: ApplicationContent;
}) => {
  const resolveObject = useApplicationContentObjectResolver(content);

  return getApplicationContentFilters({ contentType, content, resolveObject });
};
