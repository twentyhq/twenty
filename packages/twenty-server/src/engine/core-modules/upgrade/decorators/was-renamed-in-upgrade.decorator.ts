import 'reflect-metadata';

import { defineUpgradeMetadataOnClassOrProperty } from 'src/engine/core-modules/upgrade/decorators/upgrade-decorator-metadata.util';

export type WasRenamedInUpgradeHistoryEntry = {
  previousName: string;
  upgradeCommandName: string;
};

export const WAS_RENAMED_IN_UPGRADE_CLASS_METADATA_KEY =
  'WAS_RENAMED_IN_UPGRADE_CLASS';

export const WAS_RENAMED_IN_UPGRADE_PROPERTIES_METADATA_KEY =
  'WAS_RENAMED_IN_UPGRADE_PROPERTIES';

export type WasRenamedInUpgradePropertyMap = Record<
  string,
  WasRenamedInUpgradeHistoryEntry[]
>;

export const WasRenamedInUpgrade =
  (history: WasRenamedInUpgradeHistoryEntry[]) =>
  (target: object, propertyKey?: string | symbol): void => {
    defineUpgradeMetadataOnClassOrProperty({
      classMetadataKey: WAS_RENAMED_IN_UPGRADE_CLASS_METADATA_KEY,
      propertyMetadataKey: WAS_RENAMED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
      value: history,
      target,
      propertyKey,
    });
  };

export const getWasRenamedInUpgradeClassMetadata = (
  target: Function,
): WasRenamedInUpgradeHistoryEntry[] | undefined =>
  Reflect.getMetadata(WAS_RENAMED_IN_UPGRADE_CLASS_METADATA_KEY, target);

export const getWasRenamedInUpgradePropertyMetadata = (
  target: Function,
): WasRenamedInUpgradePropertyMap =>
  Reflect.getMetadata(WAS_RENAMED_IN_UPGRADE_PROPERTIES_METADATA_KEY, target) ??
  {};
