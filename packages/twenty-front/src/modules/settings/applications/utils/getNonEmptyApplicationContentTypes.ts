import { APPLICATION_CONTENT_SECTIONS } from '@/settings/applications/constants/ApplicationContentSections';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';

export const getNonEmptyApplicationContentTypes = (
  content: ApplicationContent,
) =>
  APPLICATION_CONTENT_SECTIONS.flatMap(
    (section) => section.contentTypes,
  ).filter((contentType) => content[contentType].length > 0);
