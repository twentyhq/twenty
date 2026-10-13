import { type WorkflowStepManifest } from 'twenty-shared/application';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { computeWorkflowManifestOutputSchema } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-manifest-output-schema.util';

const AGENT_UNIVERSAL_IDENTIFIER = '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11';

const AGENT_OUTPUT_SCHEMA = {
  answer: { isLeaf: true, type: 'string', label: 'answer', value: 'text' },
};

const buildAiAgentStep = (
  input: Record<string, unknown>,
): WorkflowStepManifest =>
  ({
    universalIdentifier: 'step-universal-identifier',
    name: 'Summarize',
    type: 'AI_AGENT',
    input: { prompt: 'Summarize the deal', ...input },
  }) as WorkflowStepManifest;

const references = {
  agentOutputSchemaByUniversalIdentifier: new Map([
    [AGENT_UNIVERSAL_IDENTIFIER, AGENT_OUTPUT_SCHEMA],
  ]),
} as unknown as WorkflowManifestReferences;

describe('computeWorkflowManifestOutputSchema', () => {
  it("uses the AI step's own output format over its agent's", () => {
    const outputSchema = computeWorkflowManifestOutputSchema({
      step: buildAiAgentStep({
        agentUniversalIdentifier: AGENT_UNIVERSAL_IDENTIFIER,
        responseFormat: {
          type: 'json',
          schema: {
            type: 'object',
            properties: { summary: { type: 'string' } },
          },
        },
      }),
      references,
    });

    expect(Object.keys(outputSchema)).toEqual(['summary']);
  });

  it("falls back to the agent's output format when the step gives none", () => {
    const outputSchema = computeWorkflowManifestOutputSchema({
      step: buildAiAgentStep({
        agentUniversalIdentifier: AGENT_UNIVERSAL_IDENTIFIER,
      }),
      references,
    });

    expect(outputSchema).toBe(AGENT_OUTPUT_SCHEMA);
  });
});
