import { PermissionFlagType } from '~/generated-metadata/graphql';

// Read by both surfaces that render the data model settings routes: the main
// route tree gates them with it, and the side panel repeats the gate because
// it renders those route elements without their protected wrapper.
export const SETTINGS_DATA_MODEL_PERMISSION = PermissionFlagType.DATA_MODEL;
