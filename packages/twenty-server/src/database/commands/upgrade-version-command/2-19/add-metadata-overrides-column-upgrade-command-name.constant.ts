// Step name of the 2.19 fast instance command that adds the "overrides" column
// to objectMetadata/fieldMetadata. Referenced by the upgrade-aware entity
// decorators so cross-version upgrades from pre-2.19 schemas keep working:
// before this step is applied, the new "overrides" column is hidden from
// TypeORM (earlier-version workspace steps run against the current entity code
// and must not SELECT a column that does not exist yet).
export const ADD_METADATA_OVERRIDES_COLUMN_UPGRADE_COMMAND_NAME =
  '2.19.0_AddMetadataOverridesColumnFastInstanceCommand_1820000100000';
