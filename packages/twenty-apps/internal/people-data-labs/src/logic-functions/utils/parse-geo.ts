import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

export const parseGeo = (
  geo: unknown,
): { lat: number | null; lng: number | null } => {
  const value = toText(geo);

  if (!isDefined(value)) {
    return { lat: null, lng: null };
  }

  const [latRaw, lngRaw] = value.split(',');
  const lat = Number.parseFloat(latRaw ?? '');
  const lng = Number.parseFloat(lngRaw ?? '');

  return {
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };
};
