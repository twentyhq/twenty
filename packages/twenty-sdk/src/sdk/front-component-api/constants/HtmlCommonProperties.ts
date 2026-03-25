import { type PropertySchema } from '@/front-component-renderer/types/PropertySchema';

export const HTML_COMMON_PROPERTIES: Record<string, PropertySchema> = {
  id: { type: 'string', optional: true },
  className: { type: 'string', optional: true },
  style: { type: 'string', optional: true },
  title: { type: 'string', optional: true },
  tabIndex: { type: 'number', optional: true },
  role: { type: 'string', optional: true },
  'aria-label': { type: 'string', optional: true },
  'aria-hidden': { type: 'boolean', optional: true },
  'data-testid': { type: 'string', optional: true },
};
