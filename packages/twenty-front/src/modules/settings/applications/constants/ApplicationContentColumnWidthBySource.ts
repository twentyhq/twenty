import { type ApplicationContentColumnSource } from '@/settings/applications/types/ApplicationContentColumnSource';

export const APPLICATION_CONTENT_COLUMN_WIDTH_BY_SOURCE: Record<
  ApplicationContentColumnSource,
  string
> = {
  description: 'minmax(0, 1.5fr)',
  object: 'minmax(0, 1fr)',
  parent: 'minmax(0, 1fr)',
  tag: 'minmax(0, 148px)',
  count: '88px',
  position: '88px',
  duration: '88px',
};
