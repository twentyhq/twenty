import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { serializeApplicationRegistrationForBroadcast } from 'src/engine/core-modules/application/application-registration/utils/serialize-application-registration-for-broadcast.util';

type SerializableApplicationRegistration = Parameters<
  typeof serializeApplicationRegistrationForBroadcast
>[0];

const buildApplicationRegistration = (
  overrides: Partial<SerializableApplicationRegistration> = {},
): SerializableApplicationRegistration => ({
  id: 'd0d5f1b2-1f2a-4a2e-9f7b-2f9a0c1d3e44',
  universalIdentifier: '4a4c1e2f-2a29-4f8f-9a55-2f8d0e2b4c33',
  name: 'Test registration',
  latestAvailableVersion: '1.2.0',
  sourceType: ApplicationRegistrationSourceType.NPM,
  isListed: true,
  isVetted: false,
  ownerWorkspaceId: '6b6f4a95-4a9d-4a53-9a7e-1c7c2f3b5e11',
  ...overrides,
});

describe('serializeApplicationRegistrationForBroadcast', () => {
  it('carries every field the front holds', () => {
    expect(
      serializeApplicationRegistrationForBroadcast(
        buildApplicationRegistration(),
      ),
    ).toEqual({
      id: 'd0d5f1b2-1f2a-4a2e-9f7b-2f9a0c1d3e44',
      universalIdentifier: '4a4c1e2f-2a29-4f8f-9a55-2f8d0e2b4c33',
      name: 'Test registration',
      latestAvailableVersion: '1.2.0',
      sourceType: ApplicationRegistrationSourceType.NPM,
      isListed: true,
      isVetted: false,
      ownerWorkspaceId: '6b6f4a95-4a9d-4a53-9a7e-1c7c2f3b5e11',
    });
  });

  it.each([null, undefined])(
    'emits null rather than dropping keys for %p fields',
    (unsetValue) => {
      expect(
        serializeApplicationRegistrationForBroadcast(
          buildApplicationRegistration({
            latestAvailableVersion: unsetValue,
            ownerWorkspaceId: unsetValue,
          }),
        ),
      ).toEqual(
        expect.objectContaining({
          latestAvailableVersion: null,
          ownerWorkspaceId: null,
        }),
      );
    },
  );
});
