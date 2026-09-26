import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

// OAuth-only applications (the Twenty CLI, dynamically registered MCP clients)
// ship no code and only hold tokens a user approved, so they keep that user's
// reach instead of being scoped to their own empty application.
export const isOAuthOnlyApplication = (
  application: Pick<FlatApplication, 'sourceType'>,
): boolean =>
  application.sourceType === ApplicationRegistrationSourceType.OAUTH_ONLY;
