import { z } from 'zod';

import { buildSecondWaitRefusalOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/build-second-wait-refusal-output.util';
import { buildWaitPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/build-wait-pending-output.util';
import { type AgentWaitSlot } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/agent-wait-slot.type';

const MAX_DURATION_IN_MINUTES = 60 * 24 * 365;

const waitForDurationInputSchema = z.object({
  durationInMinutes: z
    .number()
    .int()
    .positive()
    .max(MAX_DURATION_IN_MINUTES)
    .describe('How long to wait, in minutes (e.g. 1440 for one day).'),
});

export const createWaitForDurationTool = (waitSlot: AgentWaitSlot) => ({
  description:
    'Pause for a while, for example before following up. You continue once the time has passed.',
  inputSchema: waitForDurationInputSchema,
  execute: async ({
    durationInMinutes,
  }: z.infer<typeof waitForDurationInputSchema>) => {
    if (waitSlot.isTaken) {
      return buildSecondWaitRefusalOutput();
    }

    waitSlot.isTaken = true;

    const resumeAt = new Date(
      Date.now() + durationInMinutes * 60 * 1000,
    ).toISOString();

    return buildWaitPendingOutput({
      message: `Waiting until ${resumeAt}.`,
      wait: { type: 'TIME', resumeAt },
    });
  },
});
