import { type PropertySchema } from './PropertySchema';

export const SVG_PRESENTATION_PROPERTIES: Record<string, PropertySchema> = {
  fill: { type: 'string', optional: true },
  fillOpacity: { type: 'string', optional: true },
  fillRule: { type: 'string', optional: true },
  stroke: { type: 'string', optional: true },
  strokeWidth: { type: 'string', optional: true },
  strokeOpacity: { type: 'string', optional: true },
  strokeLinecap: { type: 'string', optional: true },
  strokeLinejoin: { type: 'string', optional: true },
  strokeDasharray: { type: 'string', optional: true },
  strokeDashoffset: { type: 'string', optional: true },
  strokeMiterlimit: { type: 'string', optional: true },
  opacity: { type: 'string', optional: true },
  transform: { type: 'string', optional: true },
  clipPath: { type: 'string', optional: true },
  clipRule: { type: 'string', optional: true },
  mask: { type: 'string', optional: true },
  filter: { type: 'string', optional: true },
  pointerEvents: { type: 'string', optional: true },
};
