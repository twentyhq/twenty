import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

const NULL_COORDINATES = { lat: null, lng: null } as const;

export const parseGeo = (
  geo: unknown,
): { lat: number | null; lng: number | null } => {
  const geoText = toText(geo);

  if (!isDefined(geoText)) {
    return { ...NULL_COORDINATES };
  }

  const latitudeAndLongitudeParts = geoText.split(',');
  if (latitudeAndLongitudeParts.length !== 2) {
    return { ...NULL_COORDINATES };
  }

  const latitude = Number.parseFloat(latitudeAndLongitudeParts[0]);
  const longitude = Number.parseFloat(latitudeAndLongitudeParts[1]);

  const isLatitudeInRange =
    Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
  const isLongitudeInRange =
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;

  if (!isLatitudeInRange || !isLongitudeInRange) {
    return { ...NULL_COORDINATES };
  }

  return { lat: latitude, lng: longitude };
};
