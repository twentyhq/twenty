import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

type SerializableApplication = Pick<
  ApplicationEntity,
  | 'id'
  | 'universalIdentifier'
  | 'name'
  | 'description'
  | 'version'
  | 'state'
  | 'failedOperation'
  | 'failureReason'
  | 'applicationRegistrationId'
  | 'sdkClientCoreChecksum'
>;

export const serializeApplicationForBroadcast = (
  application: SerializableApplication,
) => ({
  id: application.id,
  universalIdentifier: application.universalIdentifier,
  name: application.name,
  description: application.description ?? null,
  version: application.version ?? null,
  state: application.state,
  failedOperation: application.failedOperation ?? null,
  failureReason: application.failureReason ?? null,
  applicationRegistrationId: application.applicationRegistrationId ?? null,
  sdkClientCoreChecksum: application.sdkClientCoreChecksum ?? null,
});
