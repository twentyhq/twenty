import { APPLICATION_CONTENT_TYPES } from '@/settings/applications/constants/ApplicationContentTypes';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';

export const getApplicationContentItemCount = (content: ApplicationContent) =>
  APPLICATION_CONTENT_TYPES.reduce(
    (itemCount, contentType) => itemCount + content[contentType].length,
    0,
  );
