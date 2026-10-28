import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
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

const NO_PERMISSIONS = buildRecordFromKeysWithSameValue(
  Object.values(PermissionFlagType),
  false,
);

describe('getGettingStartedStepSelection', () => {
  it.each([
    {
      description: 'keeps the saved step and skips to the next remaining step',
      completedSteps: [GettingStartedStep.HANDOVER_DEALS],
      selectedStep: GettingStartedStep.INVITE_TEAM,
      permissionFlagMap: ALL_PERMISSIONS,
      expected: {
        selectedStep: GettingStartedStep.INVITE_TEAM,
        nextStep: GettingStartedStep.FOLLOW_UP_DEALS,
        stepAfterSkip: GettingStartedStep.FOLLOW_UP_DEALS,
      },
    },
    {
      description: 'wraps to the first remaining step',
      completedSteps: [],
      selectedStep: GettingStartedStep.FOLLOW_UP_DEALS,
      permissionFlagMap: ALL_PERMISSIONS,
      expected: {
        selectedStep: GettingStartedStep.FOLLOW_UP_DEALS,
        nextStep: GettingStartedStep.CONNECT_MAILBOX,
        stepAfterSkip: GettingStartedStep.CONNECT_MAILBOX,
      },
    },
    {
      description: 'selects the first remaining step the user can act on',
      completedSteps: [GettingStartedStep.CONNECT_MAILBOX],
      selectedStep: null,
      permissionFlagMap: {
        ...ALL_PERMISSIONS,
        [PermissionFlagType.IMPORT_CSV]: false,
      },
      expected: {
        selectedStep: GettingStartedStep.INSTALL_APP,
        nextStep: GettingStartedStep.INVITE_TEAM,
        stepAfterSkip: GettingStartedStep.INVITE_TEAM,
      },
    },
    {
      description: 'selects the first remaining step without any permission',
      completedSteps: [GettingStartedStep.CONNECT_MAILBOX],
      selectedStep: null,
      permissionFlagMap: NO_PERMISSIONS,
      expected: {
        selectedStep: GettingStartedStep.IMPORT_DATA,
        nextStep: GettingStartedStep.INSTALL_APP,
        stepAfterSkip: GettingStartedStep.INSTALL_APP,
      },
    },
    {
      description: 'selects the first step once every step is completed',
      completedSteps: mockGettingStartedSteps,
      selectedStep: null,
      permissionFlagMap: ALL_PERMISSIONS,
      expected: {
        selectedStep: GettingStartedStep.CONNECT_MAILBOX,
        nextStep: GettingStartedStep.CONNECT_MAILBOX,
        stepAfterSkip: GettingStartedStep.CONNECT_MAILBOX,
      },
    },
    {
      description: 'skips from a completed step back to the current step',
      completedSteps: [GettingStartedStep.INVITE_TEAM],
      selectedStep: GettingStartedStep.INVITE_TEAM,
      permissionFlagMap: ALL_PERMISSIONS,
      expected: {
        selectedStep: GettingStartedStep.INVITE_TEAM,
        nextStep: GettingStartedStep.HANDOVER_DEALS,
        stepAfterSkip: GettingStartedStep.CONNECT_MAILBOX,
      },
    },
  ])(
    '$description',
    ({ completedSteps, selectedStep, permissionFlagMap, expected }) => {
      expect(
        getGettingStartedStepSelection({
          steps: mockGettingStartedSteps,
          completedSteps,
          selectedStep,
          permissionFlagMap,
        }),
      ).toEqual(expected);
    },
  );
});
