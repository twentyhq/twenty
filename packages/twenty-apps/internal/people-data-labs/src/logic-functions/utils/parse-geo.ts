import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

const NULL_COORDINATES = { lat: null, lng: null } as const;

export const parseGeo = (
  geo: unknown,
): { lat: number | null; lng: number | null } => {
  const value = toText(geo);

  if (!isDefined(value)) {
    return { ...NULL_COORDINATES };
  }

  const parts = value.split(',');
  if (parts.length !== 2) {
    return { ...NULL_COORDINATES };
  }

  const lat = Number.parseFloat(parts[0]);
  const lng = Number.parseFloat(parts[1]);

  const isLatInRange = Number.isFinite(lat) && lat >= -90 && lat <= 90;
  const isLngInRange = Number.isFinite(lng) && lng >= -180 && lng <= 180;

  if (!isLatInRange || !isLngInRange) {
    return { ...NULL_COORDINATES };
  }

  return { lat, lng };
};
