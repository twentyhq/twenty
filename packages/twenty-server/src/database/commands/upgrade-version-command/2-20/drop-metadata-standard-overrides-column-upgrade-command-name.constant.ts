// Full registered name of the 2.20 drop command. Referenced by the test today,
// and ready to be wired to @WasRemovedInUpgrade on the "standardOverrides"
// columns of objectMetadata / fieldMetadata once 2.20 becomes the current
// version (see the entity comments). Must stay in sync with the
// @RegisteredInstanceCommand(version, timestamp) below.
export const DROP_METADATA_STANDARD_OVERRIDES_COLUMN_UPGRADE_COMMAND_NAME =
  '2.20.0_DropMetadataStandardOverridesColumnFastInstanceCommand_1825000000000';
