import { type PropertySchema } from './PropertySchema';

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
  // Remote code has no layout information, so scrolling an element into view
  // must happen host-side: every time this value changes to a non-empty
  // string, the host scrolls the element into the nearest scroll container.
  'data-scroll-into-view': { type: 'string', optional: true },
  draggable: { type: 'string', optional: true },
};
