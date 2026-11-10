import { APPLICATION_CONTENT_TYPES } from '@/settings/applications/constants/ApplicationContentTypes';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';

export const getNonEmptyApplicationContentTypes = (
  content: ApplicationContent,
) =>
  APPLICATION_CONTENT_TYPES.filter(
    (contentType) => content[contentType].length > 0,
  );
