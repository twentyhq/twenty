import { type WorkflowStepManifest } from 'twenty-shared/application';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { computeAiAgentOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-ai-agent-output-schema.util';

export const computeWorkflowManifestOutputSchema = ({
  step,
  references,
}: {
  step: WorkflowStepManifest;
  references: WorkflowManifestReferences;
}): Record<string, unknown> => {
  if (
    isDefined(step.outputSchema) &&
    Object.keys(step.outputSchema).length > 0
  ) {
    return step.outputSchema;
  }

  if (step.type === 'CODE' || step.type === 'LOGIC_FUNCTION') {
    const declaredOutputSchema =
      references.logicFunctionOutputSchemaByUniversalIdentifier?.get(
        step.logicFunctionUniversalIdentifier,
      );

    if (
      isDefined(declaredOutputSchema) &&
      Object.keys(declaredOutputSchema).length > 0
    ) {
      return declaredOutputSchema;
    }
  }

  if (step.type === 'AI_AGENT') {
    return isDefined(step.input.agentUniversalIdentifier)
      ? (references.agentOutputSchemaByUniversalIdentifier?.get(
          step.input.agentUniversalIdentifier,
        ) ?? computeAiAgentOutputSchema())
      : computeAiAgentOutputSchema();
  }

  return isDefined(step.expectedOutputSchema)
    ? getOutputSchemaFromValue(step.expectedOutputSchema)
    : {};
};
