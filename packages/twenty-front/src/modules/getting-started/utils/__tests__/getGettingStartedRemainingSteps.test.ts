import { getGettingStartedRemainingSteps } from '@/getting-started/utils/getGettingStartedRemainingSteps';
import {
  GettingStartedStep,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { mockGettingStartedSteps } from '~/testing/mock-data/gettingStartedSteps';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

const ALL_PERMISSIONS = buildRecordFromKeysWithSameValue(
  Object.values(PermissionFlagType),
  true,
);

describe('getGettingStartedRemainingSteps', () => {
  it.each([
    {
      description: 'excludes completed steps',
      completedSteps: [
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.INVITE_TEAM,
      ],
      permissionFlagMap: ALL_PERMISSIONS,
      expectedSteps: [
        GettingStartedStep.IMPORT_DATA,
        GettingStartedStep.INSTALL_APP,
        GettingStartedStep.HANDOVER_DEALS,
        GettingStartedStep.FOLLOW_UP_DEALS,
      ],
    },
    {
      description: 'excludes steps the user has no permission for',
      completedSteps: [],
      permissionFlagMap: {
        ...ALL_PERMISSIONS,
        [PermissionFlagType.APPLICATIONS]: false,
        [PermissionFlagType.AI]: false,
      },
      expectedSteps: [
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.IMPORT_DATA,
        GettingStartedStep.INVITE_TEAM,
        GettingStartedStep.HANDOVER_DEALS,
      ],
    },
  ])('$description', ({ completedSteps, permissionFlagMap, expectedSteps }) => {
    expect(
      getGettingStartedRemainingSteps({
        steps: mockGettingStartedSteps,
        completedSteps,
        permissionFlagMap,
      }),
    ).toEqual(expectedSteps);
  });
});
