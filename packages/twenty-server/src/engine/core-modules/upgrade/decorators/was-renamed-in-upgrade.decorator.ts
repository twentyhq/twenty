import 'reflect-metadata';

import { isDefined } from 'twenty-shared/utils';

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
    if (!isDefined(propertyKey)) {
      Reflect.defineMetadata(
        WAS_RENAMED_IN_UPGRADE_CLASS_METADATA_KEY,
        history,
        target,
      );

      return;
    }

    const constructor = (target as { constructor: Function }).constructor;
    const existing: WasRenamedInUpgradePropertyMap =
      Reflect.getMetadata(
        WAS_RENAMED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
        constructor,
      ) ?? {};

    Reflect.defineMetadata(
      WAS_RENAMED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
      { ...existing, [String(propertyKey)]: history },
      constructor,
    );
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
