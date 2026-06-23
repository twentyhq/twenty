import 'reflect-metadata';

import { isDefined } from 'twenty-shared/utils';

import { defineUpgradeMetadataOnClassOrProperty } from 'src/engine/core-modules/upgrade/decorators/upgrade-decorator-metadata.util';

export type WasIntroducedInUpgradeOptions = {
  upgradeCommandName: string;
  // Class-level escape hatch for columns inherited from a base entity (e.g.
  // SyncableEntity.universalIdentifier) that cannot carry a property decorator
  // in place. The listed property names are registered in the same
  // property-introduction map a property decorator would populate.
  properties?: readonly string[];
};

export type WasIntroducedInUpgradeClassMetadata = {
  upgradeCommandName: string;
};

export const WAS_INTRODUCED_IN_UPGRADE_CLASS_METADATA_KEY =
  'WAS_INTRODUCED_IN_UPGRADE_CLASS';

export const WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY =
  'WAS_INTRODUCED_IN_UPGRADE_PROPERTIES';

export type WasIntroducedInUpgradePropertyMap = Record<
  string,
  WasIntroducedInUpgradeClassMetadata
>;

export const WasIntroducedInUpgrade =
  (options: WasIntroducedInUpgradeOptions) =>
  (target: object, propertyKey?: string | symbol): void => {
    const value: WasIntroducedInUpgradeClassMetadata = {
      upgradeCommandName: options.upgradeCommandName,
    };

    if (!isDefined(propertyKey) && isDefined(options.properties)) {
      defineIntroducedPropertiesOnClass({
        entityClass: target as Function,
        propertyNames: options.properties,
        value,
      });

      return;
    }

    defineUpgradeMetadataOnClassOrProperty({
      classMetadataKey: WAS_INTRODUCED_IN_UPGRADE_CLASS_METADATA_KEY,
      propertyMetadataKey: WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
      value,
      target,
      propertyKey,
    });
  };

const defineIntroducedPropertiesOnClass = ({
  entityClass,
  propertyNames,
  value,
}: {
  entityClass: Function;
  propertyNames: readonly string[];
  value: WasIntroducedInUpgradeClassMetadata;
}): void => {
  const existing: WasIntroducedInUpgradePropertyMap =
    Reflect.getMetadata(
      WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
      entityClass,
    ) ?? {};

  const additions: WasIntroducedInUpgradePropertyMap = Object.fromEntries(
    propertyNames.map((propertyName) => [propertyName, value]),
  );

  Reflect.defineMetadata(
    WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
    { ...existing, ...additions },
    entityClass,
  );
};

export const getWasIntroducedInUpgradeClassMetadata = (
  target: Function,
): WasIntroducedInUpgradeClassMetadata | undefined =>
  Reflect.getMetadata(WAS_INTRODUCED_IN_UPGRADE_CLASS_METADATA_KEY, target);

export const getWasIntroducedInUpgradePropertyMetadata = (
  target: Function,
): WasIntroducedInUpgradePropertyMap =>
  Reflect.getMetadata(
    WAS_INTRODUCED_IN_UPGRADE_PROPERTIES_METADATA_KEY,
    target,
  ) ?? {};
