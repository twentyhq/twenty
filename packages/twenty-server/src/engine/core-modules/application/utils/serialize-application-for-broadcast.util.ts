import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { buildServedSdkClientCoreChecksum } from 'src/engine/core-modules/sdk-client/utils/build-served-sdk-client-core-checksum.util';

type SerializableApplication = Pick<
  ApplicationEntity,
  | 'id'
  | 'universalIdentifier'
  | 'name'
  | 'description'
  | 'version'
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
  applicationRegistrationId: application.applicationRegistrationId ?? null,
  sdkClientCoreChecksum: buildServedSdkClientCoreChecksum(
    application.sdkClientCoreChecksum,
  ),
});
