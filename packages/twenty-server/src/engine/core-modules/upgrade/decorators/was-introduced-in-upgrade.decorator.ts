import 'reflect-metadata';

import { isDefined } from 'twenty-shared/utils';

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
    if (!isDefined(propertyKey)) {
      Reflect.defineMetadata(
        WAS_INTRODUCED_IN_UPGRADE_CLASS_METADATA_KEY,
        options,
        target,
      );

      return;
    }

    const constructor = (target as { constructor: Function }).constructor;
    const existing: WasIntroducedInUpgradePropertyMap =
      Reflect.getMetadata(
        WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
        constructor,
      ) ?? {};

    Reflect.defineMetadata(
      WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
      { ...existing, [String(propertyKey)]: options },
      constructor,
    );
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
