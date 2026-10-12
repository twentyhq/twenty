// Referenced by @WasIntroducedInUpgrade on ApplicationRegistrationVersionEntity
// and on application.applicationRegistrationVersionId so upgrade steps running
// below 2.47.0 don't query them before this command creates them.
export const ADD_APPLICATION_REGISTRATION_VERSIONS_UPGRADE_COMMAND_NAME =
  '2.47.0_AddApplicationRegistrationVersionsFastInstanceCommand_1791840744303';
