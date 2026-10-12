import { isDefined } from 'twenty-shared/utils';

import { type WorkflowObjectMetadataMaps } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { computeStepOutputSchemaFromObjectMetadataMaps } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-step-output-schema-from-object-metadata-maps.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const fillWorkflowManifestOutputSchemas = ({
  trigger,
  steps,
  objectMetadataMaps,
}: {
  trigger: WorkflowTrigger;
  steps: WorkflowAction[];
  objectMetadataMaps: WorkflowObjectMetadataMaps | undefined;
}): { trigger: WorkflowTrigger; steps: WorkflowAction[] } => {
  if (!isDefined(objectMetadataMaps)) {
    return { trigger, steps };
  }

  const workflowVersionContent = { trigger, steps };

  const fill = <TStep extends WorkflowTrigger | WorkflowAction>(
    step: TStep,
  ): TStep => {
    if (Object.keys(step.settings.outputSchema).length > 0) {
      return step;
    }

    const result = { ...step };

    result.settings = {
      ...result.settings,
      outputSchema: computeStepOutputSchemaFromObjectMetadataMaps({
        step,
        objectMetadataMaps,
        workflowVersionContent,
      }),
    };

    return result;
  };

  return { trigger: fill(trigger), steps: steps.map(fill) };
};
