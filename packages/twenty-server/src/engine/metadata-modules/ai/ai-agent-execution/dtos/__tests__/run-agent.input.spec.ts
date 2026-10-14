import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RunAgentInputDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/run-agent.input';

const validationErrors = (agentUniversalIdentifier: string) =>
  validate(
    plainToInstance(RunAgentInputDTO, {
      agentUniversalIdentifier,
      input: [{ role: 'user', content: 'Hello' }],
    }),
  );

describe('RunAgentInputDTO agentUniversalIdentifier', () => {
  it('accepts a UUID', async () => {
    expect(
      await validationErrors('20202020-c7ab-4065-b822-0ca1d5de60a9'),
    ).toHaveLength(0);
  });

  it('rejects a value that is not a UUID', async () => {
    expect(await validationErrors('slack-assistant')).not.toHaveLength(0);
  });
});
