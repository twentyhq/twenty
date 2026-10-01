import { AgentTurnResolver } from 'src/engine/metadata-modules/ai/ai-agent-monitor/resolvers/agent-turn.resolver';

it('creates private evaluation history', async () => {
  const turn = { id: 'turn', threadId: 'thread' };
  const turns = {
    insertAndReturnOne: jest.fn().mockResolvedValue(turn),
    findOne: jest.fn().mockResolvedValue(turn),
  };
  const threads = {
    insertAndReturnOne: jest.fn().mockResolvedValue({ id: 'thread' }),
  };
  const queue = { add: jest.fn() };
  const agent = {
    findOneAgentById: jest.fn().mockResolvedValue({ id: 'agent' }),
  };
  const resolver = new AgentTurnResolver(
    turns as never,
    threads as never,
    queue as never,
    {} as never,
    agent as never,
  );

  await expect(
    resolver.runEvaluationInput(
      'agent',
      'Evaluate this',
      { id: 'workspace' } as never,
      'member',
      'membership',
    ),
  ).resolves.toEqual(turn);
  expect(threads.insertAndReturnOne).toHaveBeenCalledWith('workspace', {
    workspaceMemberId: 'member',
    userWorkspaceId: 'membership',
    title: 'Eval: Evaluate this...',
  });
  expect(agent.findOneAgentById).toHaveBeenCalledWith({
    id: 'agent',
    workspaceId: 'workspace',
  });
  expect(queue.add).toHaveBeenCalledWith(
    'RunEvaluationInputJob',
    expect.objectContaining({
      workspaceId: 'workspace',
      threadId: 'thread',
      turnId: 'turn',
    }),
  );
});
