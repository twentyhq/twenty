import { serializeApplicationForBroadcast } from 'src/engine/core-modules/application/utils/serialize-application-for-broadcast.util';
import { SDK_CLIENT_GENERATION_KEY } from 'src/engine/core-modules/sdk-client/constants/sdk-client-generation-key';

type SerializableApplication = Parameters<
  typeof serializeApplicationForBroadcast
>[0];

const buildApplication = (
  overrides: Partial<SerializableApplication> = {},
): SerializableApplication => ({
  id: 'a2f6b0a5-0f4a-4f9f-9f0c-6c2d5f0f4a11',
  universalIdentifier: '4a4c1e2f-2a29-4f8f-9a55-2f8d0e2b4c33',
  name: 'Test application',
  description: 'A test application',
  version: '1.0.0',
  applicationRegistrationId: 'ce4b7b8e-9e5b-4b7c-bd7a-5f2f61f0a9d2',
  sdkClientCoreChecksum: 'checksum',
  ...overrides,
});

describe('serializeApplicationForBroadcast', () => {
  it('carries every field the front holds, with the served core checksum', () => {
    expect(serializeApplicationForBroadcast(buildApplication())).toEqual({
      id: 'a2f6b0a5-0f4a-4f9f-9f0c-6c2d5f0f4a11',
      universalIdentifier: '4a4c1e2f-2a29-4f8f-9a55-2f8d0e2b4c33',
      name: 'Test application',
      description: 'A test application',
      version: '1.0.0',
      applicationRegistrationId: 'ce4b7b8e-9e5b-4b7c-bd7a-5f2f61f0a9d2',
      sdkClientCoreChecksum: `${SDK_CLIENT_GENERATION_KEY}-checksum`,
    });
  });

  it.each([null, undefined])(
    'emits null rather than dropping keys for %p fields',
    (unsetValue) => {
      const serializedApplication = serializeApplicationForBroadcast(
        buildApplication({
          description: unsetValue,
          version: unsetValue,
          applicationRegistrationId: unsetValue,
          sdkClientCoreChecksum: unsetValue,
        }),
      );

      expect(serializedApplication).toEqual(
        expect.objectContaining({
          description: null,
          version: null,
          applicationRegistrationId: null,
          sdkClientCoreChecksum: null,
        }),
      );
    },
  );
});
