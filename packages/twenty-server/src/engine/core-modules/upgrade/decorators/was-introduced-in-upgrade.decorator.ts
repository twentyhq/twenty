import 'reflect-metadata';

// Applied to an @Entity class or an @Column property to declare that it did
// not exist in the schema before the named upgrade command ran. During
// cross-version upgrade, repository operations on it short-circuit until the
// command appears in the applied set, so older steps don't query a table or
// column that the database hasn't built yet.

export type WasIntroducedInUpgradeOptions = {
  // Full name as persisted in core.upgradeMigration.name, i.e.
  // `${version}_${className}_${timestamp}` (see UpgradeCommandRegistryService).
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
    if (propertyKey === undefined) {
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
