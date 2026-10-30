import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { GETTING_STARTED_STEP_PERMISSION_FLAGS } from 'src/engine/core-modules/getting-started/constants/getting-started-step-permission-flags.constant';
import { GETTING_STARTED_WORKFLOWS } from 'src/engine/core-modules/getting-started/constants/getting-started-workflows.constant';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { buildGettingStartedWorkflowContent } from 'src/engine/core-modules/getting-started/utils/build-getting-started-workflow-content.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-01-01T00:00:00Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  }).allFlatEntityMaps;

const GETTING_STARTED_WORKFLOW_ENTRIES = Object.values(
  GettingStartedStepActionKey,
).flatMap((stepActionKey) => {
  const gettingStartedWorkflow = GETTING_STARTED_WORKFLOWS[stepActionKey];

  return isDefined(gettingStartedWorkflow)
    ? [{ stepActionKey, gettingStartedWorkflow }]
    : [];
});

describe('buildGettingStartedWorkflowContent', () => {
  it.each(GETTING_STARTED_WORKFLOW_ENTRIES)(
    'should build the $stepActionKey workflow from the standard metadata',
    ({ stepActionKey, gettingStartedWorkflow }) => {
      const { trigger, steps } = buildGettingStartedWorkflowContent({
        gettingStartedWorkflow,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(trigger.name).toBe(gettingStartedWorkflow.triggerTitle.message);
      expect(steps.map((workflowStep) => workflowStep.id)).toEqual(
        gettingStartedWorkflow.manifest.version.steps.map(
          (manifestStep) => manifestStep.universalIdentifier,
        ),
      );
      expect(GETTING_STARTED_STEP_PERMISSION_FLAGS[stepActionKey]).toEqual([
        PermissionFlagType.WORKFLOWS,
      ]);
    },
  );

  it.each(GETTING_STARTED_WORKFLOW_ENTRIES)(
    'should chain the $stepActionKey steps in order and title only its own steps',
    ({ gettingStartedWorkflow }) => {
      const { trigger, steps } = gettingStartedWorkflow.manifest.version;
      const stepUniversalIdentifiers = steps.map(
        (manifestStep) => manifestStep.universalIdentifier,
      );

      expect(trigger.nextStepIds).toEqual(stepUniversalIdentifiers.slice(0, 1));
      steps.forEach((manifestStep, index) => {
        expect(manifestStep.nextStepIds).toEqual(
          stepUniversalIdentifiers.slice(index + 1, index + 2),
        );
      });
      const titledStepUniversalIdentifiers = Object.keys(
        gettingStartedWorkflow.stepTitles,
      );

      expect(titledStepUniversalIdentifiers.length).toBeGreaterThan(0);
      titledStepUniversalIdentifiers.forEach(
        (titledStepUniversalIdentifier) => {
          expect(
            steps.find(
              (manifestStep) =>
                manifestStep.universalIdentifier ===
                titledStepUniversalIdentifier,
            )?.name,
          ).toBe(
            gettingStartedWorkflow.stepTitles[titledStepUniversalIdentifier]
              ?.message,
          );
        },
      );
    },
  );

  it.each([
    { before: 'PROPOSAL', after: 'CUSTOMER', expected: true },
    { before: 'PROPOSAL', after: 'PROPOSAL', expected: false },
  ])(
    'should start the handover from $before to $after: $expected',
    ({ before, after, expected }) => {
      const handoverWorkflow =
        GETTING_STARTED_WORKFLOWS[GettingStartedStepActionKey.HANDOVER_DEALS];

      if (!isDefined(handoverWorkflow)) {
        throw new Error('The handover step has no workflow');
      }

      const { trigger } = handoverWorkflow.manifest.version;

      if (trigger.type !== 'DATABASE_EVENT') {
        throw new Error('The handover workflow starts on a record event');
      }

      const { filter } = trigger.settings;

      expect(
        evaluateStepFilters({
          stepFilterGroups: filter?.stepFilterGroups ?? [],
          stepFilters: filter?.stepFilters ?? [],
          context: {
            trigger: {
              properties: {
                before: { stage: before },
                after: { stage: after },
              },
            },
          },
        }),
      ).toBe(expected);
    },
  );
});
