import { type Expect } from 'twenty-shared/testing';
import { type BrandedType, type HasBrandedType } from 'twenty-shared/types';

// A foreign key column that is already NOT NULL at the current version but that
// a released upgrade command still has to leave unset while it runs against an
// older schema. Drop the wrapper once those commands fall out of
// TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS.
export type NullableUntilUpgrade<TValue> = BrandedType<
  TValue,
  'nullableUntilUpgrade'
> | null;

// oxlint-disable-next-line unused-imports/no-unused-vars
type NullableUntilUpgradeTests = [
  Expect<
    HasBrandedType<
      NonNullable<NullableUntilUpgrade<string>>,
      'nullableUntilUpgrade'
    >
  >,
  Expect<
    HasBrandedType<
      NonNullable<string | null>,
      'nullableUntilUpgrade'
    > extends false
      ? true
      : false
  >,

  Expect<NullableUntilUpgrade<string> extends string | null ? true : false>,
  Expect<null extends NullableUntilUpgrade<string> ? true : false>,
  Expect<string extends NullableUntilUpgrade<string> ? true : false>,
];
