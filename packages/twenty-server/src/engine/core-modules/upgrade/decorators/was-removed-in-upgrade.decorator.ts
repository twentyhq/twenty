import 'reflect-metadata';

import { type Equal, type Expect } from 'twenty-shared/testing';
import { type BrandedType, type HasBrandedType } from 'twenty-shared/types';

import { defineUpgradeMetadataOnClassOrProperty } from 'src/engine/core-modules/upgrade/decorators/upgrade-decorator-metadata.util';

export type WasRemovedInUpgradeOptions = {
  upgradeCommandName: string;
};

export type WasRemovedInUpgrade<T> = BrandedType<T, 'wasRemovedInUpgrade'>;

// Distributive: a brand intersects each union member, so stripping it is per member
export type UnwrapWasRemovedInUpgrade<T> =
  T extends WasRemovedInUpgrade<infer TUnwrapped> ? TUnwrapped : T;

// NonNullable first: a brand is intersected with the non-null type, so a nullable property carries it on that member only
type WasRemovedInUpgradeKeys<TEntity> = {
  [K in keyof TEntity]: HasBrandedType<
    NonNullable<TEntity[K]>,
    'wasRemovedInUpgrade'
  > extends true
    ? K
    : never;
}[keyof TEntity];

export type MakeWasRemovedInUpgradePropertiesOptional<TEntity> = Omit<
  TEntity,
  WasRemovedInUpgradeKeys<TEntity>
> &
  Partial<Pick<TEntity, WasRemovedInUpgradeKeys<TEntity>>>;

export const WAS_REMOVED_IN_UPGRADE_CLASS_METADATA_KEY =
  'WAS_REMOVED_IN_UPGRADE_CLASS';

export const WAS_REMOVED_IN_UPGRADE_PROPERTIES_METADATA_KEY =
  'WAS_REMOVED_IN_UPGRADE_PROPERTIES';

export type WasRemovedInUpgradePropertyMap = Record<
  string,
  WasRemovedInUpgradeOptions
>;

export const WasRemovedInUpgrade =
  (options: WasRemovedInUpgradeOptions) =>
  (target: object, propertyKey?: string | symbol): void => {
    defineUpgradeMetadataOnClassOrProperty({
      classMetadataKey: WAS_REMOVED_IN_UPGRADE_CLASS_METADATA_KEY,
      propertyMetadataKey: WAS_REMOVED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
      value: options,
      target,
      propertyKey,
    });
  };

export const getWasRemovedInUpgradeClassMetadata = (
  target: Function,
): WasRemovedInUpgradeOptions | undefined =>
  Reflect.getMetadata(WAS_REMOVED_IN_UPGRADE_CLASS_METADATA_KEY, target);

export const getWasRemovedInUpgradePropertyMetadata = (
  target: Function,
): WasRemovedInUpgradePropertyMap =>
  Reflect.getMetadata(WAS_REMOVED_IN_UPGRADE_PROPERTIES_METADATA_KEY, target) ??
  {};

// oxlint-disable-next-line unused-imports/no-unused-vars
type WasRemovedInUpgradeTests = [
  Expect<
    Equal<
      MakeWasRemovedInUpgradePropertiesOptional<{
        kept: string;
        dropped: WasRemovedInUpgrade<string>;
      }>,
      { kept: string } & { dropped?: WasRemovedInUpgrade<string> }
    >
  >,

  Expect<Equal<UnwrapWasRemovedInUpgrade<WasRemovedInUpgrade<string>>, string>>,
  Expect<
    Equal<
      UnwrapWasRemovedInUpgrade<WasRemovedInUpgrade<string> | null>,
      string | null
    >
  >,
  Expect<Equal<UnwrapWasRemovedInUpgrade<string | null>, string | null>>,

  Expect<null extends WasRemovedInUpgrade<string> | null ? true : false>,
];
