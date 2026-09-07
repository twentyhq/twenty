import { compareByCodePoint } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-code-point.util';

const LAST_POSITION = Number.MAX_SAFE_INTEGER;

export const compareByPositionThenUniversalIdentifier =
  <TFlatEntity extends { universalIdentifier: string }>(
    getPosition: (flatEntity: TFlatEntity) => number | null,
  ) =>
  (left: TFlatEntity, right: TFlatEntity): number =>
    (getPosition(left) ?? LAST_POSITION) -
      (getPosition(right) ?? LAST_POSITION) ||
    compareByCodePoint(left.universalIdentifier, right.universalIdentifier);
