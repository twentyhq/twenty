import { APPLICATION_CONTENT_SECTIONS } from '@/settings/applications/constants/ApplicationContentSections';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

export const getApplicationContentSection = (
  contentType: ApplicationContentType,
) =>
  APPLICATION_CONTENT_SECTIONS.find((section) =>
    section.contentTypes.includes(contentType),
  );
