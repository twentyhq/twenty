import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

// A workspace may bind to a registration it owns, and to marketplace
// registrations that are listed or pre-installed. Sharing the publisher's
// server-side state (registration variables, SERVER key-value entries) across
// installing workspaces is the marketplace design, so this predicate is the
// whole boundary protecting an unlisted publisher's secrets.
export const canWorkspaceUseApplicationRegistration = ({
  registration,
  workspaceId,
}: {
  registration: Pick<
    ApplicationRegistrationEntity,
    'ownerWorkspaceId' | 'isListed' | 'isPreInstalled'
  >;
  workspaceId: string;
}): boolean =>
  registration.ownerWorkspaceId === workspaceId ||
  registration.isListed ||
  registration.isPreInstalled;
