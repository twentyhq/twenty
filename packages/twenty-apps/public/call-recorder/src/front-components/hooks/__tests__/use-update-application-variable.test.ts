import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { useUpdateApplicationVariable } from 'src/front-components/hooks/use-update-application-variable';

const metadataMutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    mutation = metadataMutationMock;
  },
}));

vi.mock(
  'src/front-components/utils/resolve-call-recorder-application-id.util',
  () => ({
    resolveCallRecorderApplicationId: async () => 'application-id',
  }),
);

describe('useUpdateApplicationVariable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    metadataMutationMock.mockResolvedValue({});
  });

  it('saves a workspace value on the application by default', async () => {
    const isUpdated =
      await useUpdateApplicationVariable().updateApplicationVariable({
        variableKey: 'RECORDER_NAME',
        value: 'Notetaker',
      });

    expect(isUpdated).toBe(true);
    expect(metadataMutationMock).toHaveBeenCalledWith({
      updateOneApplicationVariable: {
        __args: {
          key: 'RECORDER_NAME',
          value: 'Notetaker',
          applicationId: 'application-id',
        },
      },
    });
  });

  it("saves a user value as the member's own", async () => {
    const isUpdated =
      await useUpdateApplicationVariable().updateApplicationVariable({
        variableKey: 'MEMBER_CHOICE',
        value: 'INTERNAL',
        scope: 'USER',
      });

    expect(isUpdated).toBe(true);
    expect(metadataMutationMock).toHaveBeenCalledWith({
      updateMyUserApplicationVariable: {
        __args: {
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          key: 'MEMBER_CHOICE',
          value: 'INTERNAL',
        },
      },
    });
  });

  it('reports a failed save', async () => {
    metadataMutationMock.mockRejectedValue(new Error('forbidden'));

    await expect(
      useUpdateApplicationVariable().updateApplicationVariable({
        variableKey: 'MEMBER_CHOICE',
        value: 'INTERNAL',
        scope: 'USER',
      }),
    ).resolves.toBe(false);
  });
});
