const MAX_REFLECTED_UNSIGNED_LONG = 2147483647;

export const normalizeImageDimensionAttribute = (
  dimension: unknown,
): number => {
  const unsignedDimension = Number(dimension) >>> 0;

  return unsignedDimension > MAX_REFLECTED_UNSIGNED_LONG
    ? 0
    : unsignedDimension;
};
