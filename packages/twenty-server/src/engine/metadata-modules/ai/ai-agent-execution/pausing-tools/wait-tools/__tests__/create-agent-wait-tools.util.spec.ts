import { createAgentWaitTools } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-agent-wait-tools.util';

describe('createAgentWaitTools', () => {
  it('refuses a second wait of the same execution so only one is pending', async () => {
    const tools = createAgentWaitTools();

    await expect(
      tools.wait_for_event.execute({
        objectName: 'company',
        action: 'updated',
      }),
    ).resolves.toMatchObject({ result: { status: 'pending' } });

    await expect(
      tools.wait_for_duration.execute({ durationInMinutes: 60 }),
    ).resolves.toMatchObject({ success: false });
  });

  it('only keeps a field filter on updates, where events report changed fields', async () => {
    const createdEventWait =
      await createAgentWaitTools().wait_for_event.execute({
        objectName: 'company',
        action: 'created',
        updatedFields: ['name'],
      });
    const updatedEventWait =
      await createAgentWaitTools().wait_for_event.execute({
        objectName: 'company',
        action: 'updated',
        updatedFields: ['name'],
      });

    expect(createdEventWait).toMatchObject({
      result: { wait: { type: 'EVENT', eventName: 'company.created' } },
    });
    expect(createdEventWait).not.toHaveProperty('result.wait.updatedFields');
    expect(updatedEventWait).toMatchObject({
      result: {
        wait: {
          type: 'EVENT',
          eventName: 'company.updated',
          updatedFields: ['name'],
        },
      },
    });
  });

  it('gives each execution its own wait', async () => {
    const firstExecutionTools = createAgentWaitTools();
    const secondExecutionTools = createAgentWaitTools();

    await firstExecutionTools.wait_for_duration.execute({
      durationInMinutes: 5,
    });

    await expect(
      secondExecutionTools.wait_for_duration.execute({ durationInMinutes: 5 }),
    ).resolves.toMatchObject({ result: { status: 'pending' } });
  });
});
