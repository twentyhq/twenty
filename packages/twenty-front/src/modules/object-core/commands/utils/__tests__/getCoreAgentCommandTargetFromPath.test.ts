import { getCoreAgentCommandTargetFromPath } from '@/object-core/commands/utils/getCoreAgentCommandTargetFromPath';

it('recognizes agent routes without capturing neighboring routes', () => {
  expect(getCoreAgentCommandTargetFromPath('/agents')).toEqual({
    type: 'index',
    tableId: 'coreAgents',
  });
  expect(getCoreAgentCommandTargetFromPath('/agent/agent-id')).toEqual({
    type: 'record',
    agentId: 'agent-id',
  });
  expect(
    getCoreAgentCommandTargetFromPath('/agent/agent-id/settings'),
  ).toBeNull();
  expect(getCoreAgentCommandTargetFromPath('/agents/agent-id')).toBeNull();
  expect(getCoreAgentCommandTargetFromPath('/agents-other')).toBeNull();
});
