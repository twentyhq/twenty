import { APPLICATION_CONTENT_SECTIONS } from '@/settings/applications/constants/ApplicationContentSections';

export const APPLICATION_CONTENT_TYPES = APPLICATION_CONTENT_SECTIONS.flatMap(
  (section) => section.contentTypes,
);
