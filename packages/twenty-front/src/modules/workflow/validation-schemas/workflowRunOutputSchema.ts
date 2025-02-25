import { z } from 'zod';

const workflowTriggerSchema = z.any();

const workflowExecutorOutputSchema = z.object({
  result: z.any().optional(),
  error: z.string().optional(),
});

const stepRunOutputSchema = z.object({
  id: z.string(),
  output: workflowExecutorOutputSchema,
});

const workflowRunOutputStepsOutputSchema = z.record(stepRunOutputSchema);

export const workflowRunOutputSchema = z.object({
  flow: z.object({
    trigger: workflowTriggerSchema,
    steps: z.array(z.any()),
  }),
  stepsOutput: workflowRunOutputStepsOutputSchema.optional(),
  error: z.string().optional(),
});
