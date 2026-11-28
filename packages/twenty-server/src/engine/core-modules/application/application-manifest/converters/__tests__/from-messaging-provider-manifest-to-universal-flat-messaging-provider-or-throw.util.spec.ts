import { fromMessagingProviderManifestToUniversalFlatMessagingProviderOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-messaging-provider-manifest-to-universal-flat-messaging-provider-or-throw.util';

const MESSAGING_PROVIDER_MANIFEST = {
  universalIdentifier: '8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d',
  name: 'linkedin-messaging',
  displayName: 'LinkedIn Messages',
  connectionProvider: {
    universalIdentifier: '5b0e6f3a-2c4d-4e8f-9a1b-7c6d5e4f3a2b',
  },
};

describe('fromMessagingProviderManifestToUniversalFlatMessagingProviderOrThrow', () => {
  it('stores no conversation style when the app declares none', () => {
    expect(
      fromMessagingProviderManifestToUniversalFlatMessagingProviderOrThrow({
        messagingProviderManifest: MESSAGING_PROVIDER_MANIFEST,
        applicationUniversalIdentifier: 'application-universal-identifier',
        now: '2026-11-09T00:00:00.000Z',
      }).conversationStyle,
    ).toBeNull();
  });

  it('keeps the conversation style the app declares', () => {
    expect(
      fromMessagingProviderManifestToUniversalFlatMessagingProviderOrThrow({
        messagingProviderManifest: {
          ...MESSAGING_PROVIDER_MANIFEST,
          conversationStyle: 'chat',
        },
        applicationUniversalIdentifier: 'application-universal-identifier',
        now: '2026-11-09T00:00:00.000Z',
      }).conversationStyle,
    ).toBe('chat');
  });

  it('reads references written as universal identifiers', () => {
    expect(
      fromMessagingProviderManifestToUniversalFlatMessagingProviderOrThrow({
        messagingProviderManifest: {
          universalIdentifier: MESSAGING_PROVIDER_MANIFEST.universalIdentifier,
          name: MESSAGING_PROVIDER_MANIFEST.name,
          displayName: MESSAGING_PROVIDER_MANIFEST.displayName,
          connectionProviderUniversalIdentifier:
            '5b0e6f3a-2c4d-4e8f-9a1b-7c6d5e4f3a2b',
          sendMessageLogicFunctionUniversalIdentifier:
            '6c1f7a4b-3d5e-4f9a-8b2c-8d7e6f5a4b3c',
        },
        applicationUniversalIdentifier: 'application-universal-identifier',
        now: '2026-11-09T00:00:00.000Z',
      }),
    ).toMatchObject({
      connectionProviderUniversalIdentifier:
        '5b0e6f3a-2c4d-4e8f-9a1b-7c6d5e4f3a2b',
      sendMessageLogicFunctionUniversalIdentifier:
        '6c1f7a4b-3d5e-4f9a-8b2c-8d7e6f5a4b3c',
      markThreadAsReadLogicFunctionUniversalIdentifier: null,
    });
  });

  it('keeps the start conversation logic function the app declares', () => {
    expect(
      fromMessagingProviderManifestToUniversalFlatMessagingProviderOrThrow({
        messagingProviderManifest: {
          ...MESSAGING_PROVIDER_MANIFEST,
          startConversationLogicFunctionUniversalIdentifier:
            '7d2a8b5c-4e6f-4a0b-9c3d-9e8f7a6b5c4d',
        },
        applicationUniversalIdentifier: 'application-universal-identifier',
        now: '2026-11-09T00:00:00.000Z',
      }).startConversationLogicFunctionUniversalIdentifier,
    ).toBe('7d2a8b5c-4e6f-4a0b-9c3d-9e8f7a6b5c4d');
  });

  it('rejects a messaging provider without a connection provider', () => {
    expect(() =>
      fromMessagingProviderManifestToUniversalFlatMessagingProviderOrThrow({
        messagingProviderManifest: {
          universalIdentifier: MESSAGING_PROVIDER_MANIFEST.universalIdentifier,
          name: MESSAGING_PROVIDER_MANIFEST.name,
          displayName: MESSAGING_PROVIDER_MANIFEST.displayName,
        },
        applicationUniversalIdentifier: 'application-universal-identifier',
        now: '2026-11-09T00:00:00.000Z',
      }),
    ).toThrow('must declare connectionProviderUniversalIdentifier');
  });
});
