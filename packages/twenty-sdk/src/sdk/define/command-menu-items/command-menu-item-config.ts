import { type CommandMenuItemManifest } from 'twenty-shared/application';

// Standalone command menu item config. The `frontComponentUniversalIdentifier`
// is already required on the manifest type, so no Omit is needed here — passing
// it is what distinguishes the standalone form from the nested `command:` field
// on `defineFrontComponent`.
export type CommandMenuItemConfig = CommandMenuItemManifest;
