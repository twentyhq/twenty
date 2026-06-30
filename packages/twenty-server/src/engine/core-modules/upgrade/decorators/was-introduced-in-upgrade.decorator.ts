import 'reflect-metadata';

import { defineUpgradeMetadataOnClassOrProperty } from 'src/engine/core-modules/upgrade/decorators/upgrade-decorator-metadata.util';

export type WasIntroducedInUpgradeOptions = {
  upgradeCommandName: string;
};

export const WAS_INTRODUCED_IN_UPGRADE_CLASS_METADATA_KEY =
  'WAS_INTRODUCED_IN_UPGRADE_CLASS';

export const WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY =
  'WAS_INTRODUCED_IN_UPGRADE_PROPERTIES';

export type WasIntroducedInUpgradePropertyMap = Record<
  string,
  WasIntroducedInUpgradeOptions
>;

export const WasIntroducedInUpgrade =
  (options: WasIntroducedInUpgradeOptions) =>
  (target: object, propertyKey?: string | symbol): void => {
    defineUpgradeMetadataOnClassOrProperty({
      classMetadataKey: WAS_INTRODUCED_IN_UPGRADE_CLASS_METADATA_KEY,
      propertyMetadataKey: WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
      value: options,
      target,
      propertyKey,
    });
  };

export const getWasIntroducedInUpgradeClassMetadata = (
  target: Function,
): WasIntroducedInUpgradeOptions | undefined =>
  Reflect.getMetadata(WAS_INTRODUCED_IN_UPGRADE_CLASS_METADATA_KEY, target);

export const getWasIntroducedInUpgradePropertyMetadata = (
  target: Function,
): WasIntroducedInUpgradePropertyMap =>
  Reflect.getMetadata(
    WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
    target,
  ) ?? {};
