import { AgentTurnResolver } from 'src/engine/metadata-modules/ai/ai-agent-monitor/resolvers/agent-turn.resolver';
import { LEGACY_CHAT_THREAD_OWNER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/ai/ai-chat/constants/legacy-chat-thread-owner-field-universal-identifier.constant';

it.each([true, false])(
  'creates private evaluation history before and after owner contraction (%s)',
  async (hasLegacyOwner) => {
    const turn = { id: 'turn', threadId: 'thread' };
    const turns = {
      insertAndReturnOne: jest.fn().mockResolvedValue(turn),
      findOne: jest.fn().mockResolvedValue(turn),
    };
    const threads = {
      insertAndReturnOne: jest.fn().mockResolvedValue({ id: 'thread' }),
    };
    const cache = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatFieldMetadataMaps: {
          byUniversalIdentifier: hasLegacyOwner
            ? { [LEGACY_CHAT_THREAD_OWNER_FIELD_UNIVERSAL_IDENTIFIER]: {} }
            : {},
        },
      }),
    };
    const queue = { add: jest.fn() };
    const agent = {
      findOneAgentById: jest.fn().mockResolvedValue({ id: 'agent' }),
    };
    const resolver = new AgentTurnResolver(
      turns as never,
      threads as never,
      cache as never,
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
      ...(hasLegacyOwner ? { userWorkspaceId: 'membership' } : {}),
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
  },
);
