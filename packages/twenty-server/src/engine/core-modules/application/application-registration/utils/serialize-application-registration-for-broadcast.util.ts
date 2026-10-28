import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

type SerializableApplicationRegistration = Pick<
  ApplicationRegistrationEntity,
  | 'id'
  | 'universalIdentifier'
  | 'name'
  | 'latestAvailableVersion'
  | 'sourceType'
  | 'isListed'
  | 'isOfficial'
  | 'ownerWorkspaceId'
>;

export const serializeApplicationRegistrationForBroadcast = (
  applicationRegistration: SerializableApplicationRegistration,
) => ({
  id: applicationRegistration.id,
  universalIdentifier: applicationRegistration.universalIdentifier,
  name: applicationRegistration.name,
  latestAvailableVersion:
    applicationRegistration.latestAvailableVersion ?? null,
  sourceType: applicationRegistration.sourceType,
  isListed: applicationRegistration.isListed,
  isOfficial: applicationRegistration.isOfficial,
  ownerWorkspaceId: applicationRegistration.ownerWorkspaceId ?? null,
});
