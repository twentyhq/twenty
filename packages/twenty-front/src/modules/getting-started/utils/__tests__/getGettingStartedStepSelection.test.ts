import { GETTING_STARTED_STEPS } from '@/getting-started/constants/GettingStartedSteps';
import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import {
  GettingStartedStep,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
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
      savedSelectedStep: GettingStartedStep.INVITE_TEAM,
      permissionFlagMap: ALL_PERMISSIONS,
      expected: {
        selectedStep: GettingStartedStep.INVITE_TEAM,
        stepAfterSkip: GettingStartedStep.FOLLOW_UP_DEALS,
      },
    },
    {
      description: 'selects the first remaining step the user can act on',
      completedSteps: [GettingStartedStep.CONNECT_MAILBOX],
      savedSelectedStep: null,
      permissionFlagMap: {
        ...ALL_PERMISSIONS,
        [PermissionFlagType.IMPORT_CSV]: false,
      },
      expected: {
        selectedStep: GettingStartedStep.INSTALL_APP,
        stepAfterSkip: GettingStartedStep.INVITE_TEAM,
      },
    },
    {
      description: 'selects the first remaining step without any permission',
      completedSteps: [GettingStartedStep.CONNECT_MAILBOX],
      savedSelectedStep: null,
      permissionFlagMap: NO_PERMISSIONS,
      expected: {
        selectedStep: GettingStartedStep.IMPORT_DATA,
        stepAfterSkip: GettingStartedStep.INSTALL_APP,
      },
    },
    {
      description: 'selects the first step once every step is completed',
      completedSteps: GETTING_STARTED_STEPS,
      savedSelectedStep: null,
      permissionFlagMap: ALL_PERMISSIONS,
      expected: {
        selectedStep: GettingStartedStep.CONNECT_MAILBOX,
        stepAfterSkip: GettingStartedStep.CONNECT_MAILBOX,
      },
    },
    {
      description: 'skips from a completed step back to the current step',
      completedSteps: [GettingStartedStep.INVITE_TEAM],
      savedSelectedStep: GettingStartedStep.INVITE_TEAM,
      permissionFlagMap: ALL_PERMISSIONS,
      expected: {
        selectedStep: GettingStartedStep.INVITE_TEAM,
        stepAfterSkip: GettingStartedStep.CONNECT_MAILBOX,
      },
    },
  ])(
    '$description',
    ({ completedSteps, savedSelectedStep, permissionFlagMap, expected }) => {
      expect(
        getGettingStartedStepSelection({
          completedSteps,
          savedSelectedStep,
          permissionFlagMap,
        }),
      ).toEqual(expected);
    },
  );
});
