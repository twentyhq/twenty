import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';

const INPUT = {
  appSecret: 'app-secret',
  workspaceId: '20202020-6b1e-4b5e-8f0a-3c2d1e0f9a8b',
  applicationId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  agentId: '20202020-9e3b-46d4-a556-88b9ddc2b034',
  threadKey: 'C123:1700000000.000100',
};

describe('buildAgentRunThreadId', () => {
  it('should derive the same thread id for the same key', () => {
    expect(buildAgentRunThreadId(INPUT)).toBe(buildAgentRunThreadId(INPUT));
  });

  it.each([
    { appSecret: 'other-app-secret' },
    { workspaceId: '20202020-2a4c-4e8d-9b1f-7d6e5c4b3a29' },
    { applicationId: '20202020-3d15-4f4d-a9b6-1fd1d0a8b5c0' },
    { agentId: '20202020-7a6f-4b2e-9c33-2f1e6b7c8d90' },
    { threadKey: 'C123:2' },
  ])('should give another thread id when %o differs', (override) => {
    expect(buildAgentRunThreadId({ ...INPUT, ...override })).not.toBe(
      buildAgentRunThreadId(INPUT),
    );
  });
});
