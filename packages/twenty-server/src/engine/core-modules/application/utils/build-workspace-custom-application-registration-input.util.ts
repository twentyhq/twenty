import { v4 } from 'uuid';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';

// Builds the workspace-scoped applicationRegistration that backs a workspace's
// Custom application. Translations for custom objects/fields are stored in
// core.applicationTranslation keyed by this registration's id, so each
// workspace gets its own isolated catalog — exactly like an installed app.
//
// The registration reuses the Custom application's universalIdentifier (a
// per-workspace uuid, hence globally unique) to keep the same
// application.universalIdentifier === registration.universalIdentifier
// invariant that installed apps already follow. oAuthClientId is required and
// unique but unused (the Custom app does no OAuth), so a fresh uuid is fine.
export const buildWorkspaceCustomApplicationRegistrationInput = ({
  workspaceId,
  universalIdentifier,
}: {
  workspaceId: string;
  universalIdentifier: string;
}): Partial<ApplicationRegistrationEntity> => ({
  universalIdentifier,
  name: WORKSPACE_CUSTOM_APPLICATION_NAME,
  oAuthClientId: v4(),
  oAuthClientSecretHash: null,
  oAuthRedirectUris: [],
  oAuthScopes: [],
  ownerWorkspaceId: workspaceId,
  sourceType: ApplicationRegistrationSourceType.LOCAL,
  createdByUserId: null,
});
