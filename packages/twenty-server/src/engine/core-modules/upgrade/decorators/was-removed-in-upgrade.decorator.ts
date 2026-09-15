import 'reflect-metadata';

import { defineUpgradeMetadataOnClassOrProperty } from 'src/engine/core-modules/upgrade/decorators/upgrade-decorator-metadata.util';

export type WasRemovedInUpgradeOptions = {
  upgradeCommandName: string;
};

declare const wasRemovedInUpgradeBrand: unique symbol;

export type WasRemovedInUpgrade<T> = T & {
  readonly [wasRemovedInUpgradeBrand]?: true;
};

export type UnwrapWasRemovedInUpgrade<T> = [T] extends [
  WasRemovedInUpgrade<infer TUnwrapped>,
]
  ? TUnwrapped
  : T;

type WasRemovedInUpgradeKeys<TEntity> = {
  [K in keyof TEntity]: typeof wasRemovedInUpgradeBrand extends keyof TEntity[K]
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
