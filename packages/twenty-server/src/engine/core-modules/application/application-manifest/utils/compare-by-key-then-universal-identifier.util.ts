import { compareByCodePoint } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-code-point.util';

export const compareByKeyThenUniversalIdentifier =
  <TFlatEntity extends { universalIdentifier: string }>(
    getKey: (flatEntity: TFlatEntity) => string,
  ) =>
  (left: TFlatEntity, right: TFlatEntity): number =>
    compareByCodePoint(getKey(left), getKey(right)) ||
    compareByCodePoint(left.universalIdentifier, right.universalIdentifier);
