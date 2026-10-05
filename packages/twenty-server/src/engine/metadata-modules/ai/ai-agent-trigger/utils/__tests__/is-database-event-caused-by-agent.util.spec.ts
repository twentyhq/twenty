import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { FieldActorSource } from 'twenty-shared/types';

import { isDatabaseEventCausedByAgent } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/is-database-event-caused-by-agent.util';

const AGENT_ID = '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11';

const agentActor = (agentId: string) => ({
  source: FieldActorSource.AGENT,
  workspaceMemberId: null,
  name: 'Enricher',
  context: { agentId },
});

const buildEvent = (after: object): ObjectRecordEvent =>
  ({ recordId: 'record-id', properties: { after } }) as ObjectRecordEvent;

describe('isDatabaseEventCausedByAgent', () => {
  it('should attribute a creation to the agent that created the record', () => {
    expect(
      isDatabaseEventCausedByAgent({
        event: buildEvent({ createdBy: agentActor(AGENT_ID) }),
        eventName: 'company.created',
        agentId: AGENT_ID,
      }),
    ).toBe(true);
  });

  it('should attribute an update to the agent that last updated the record', () => {
    expect(
      isDatabaseEventCausedByAgent({
        event: buildEvent({ updatedBy: agentActor(AGENT_ID) }),
        eventName: 'company.updated',
        agentId: AGENT_ID,
      }),
    ).toBe(true);
  });

  it('should not attribute an update made by another agent', () => {
    expect(
      isDatabaseEventCausedByAgent({
        event: buildEvent({
          updatedBy: agentActor('0d2b1a8c-77a4-4e2e-8f0c-3a8e9f6b4c22'),
        }),
        eventName: 'company.updated',
        agentId: AGENT_ID,
      }),
    ).toBe(false);
  });

  it('should never attribute a deletion', () => {
    expect(
      isDatabaseEventCausedByAgent({
        event: buildEvent({ updatedBy: agentActor(AGENT_ID) }),
        eventName: 'company.deleted',
        agentId: AGENT_ID,
      }),
    ).toBe(false);
  });
});
