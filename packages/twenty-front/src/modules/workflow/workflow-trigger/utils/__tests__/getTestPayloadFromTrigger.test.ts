import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { getTestPayloadFromTrigger } from '@/workflow/workflow-trigger/utils/getTestPayloadFromTrigger';

describe('getTestPayloadFromTrigger', () => {
  it('returns undefined for a manual trigger', () => {
    const trigger: WorkflowTrigger = {
      type: 'MANUAL',
      name: 'Test',
      settings: {
        outputSchema: {},
      },
    };

    expect(getTestPayloadFromTrigger({ trigger })).toBeUndefined();
  });

  it('returns undefined for a cron trigger', () => {
    const trigger: WorkflowTrigger = {
      type: 'CRON',
      name: 'Test',
      settings: {
        type: 'DAYS',
        schedule: { day: 1, hour: 0, minute: 0 },
        outputSchema: {},
      },
    };

    expect(getTestPayloadFromTrigger({ trigger })).toBeUndefined();
  });

  it('returns expectedBody for a POST webhook trigger', () => {
    const expectedBody = { message: 'Workflow was started', count: 42 };
    const trigger: WorkflowTrigger = {
      type: 'WEBHOOK',
      name: 'Test',
      settings: {
        httpMethod: 'POST',
        expectedBody,
        outputSchema: {},
        authentication: null,
      },
    };

    expect(getTestPayloadFromTrigger({ trigger })).toEqual(expectedBody);
  });

  it('returns undefined for a GET webhook trigger', () => {
    const trigger: WorkflowTrigger = {
      type: 'WEBHOOK',
      name: 'Test',
      settings: {
        httpMethod: 'GET',
        outputSchema: {},
        authentication: null,
      },
    };

    expect(getTestPayloadFromTrigger({ trigger })).toBeUndefined();
  });

  it('throws for a database event trigger without a test record', () => {
    const trigger: WorkflowTrigger = {
      type: 'DATABASE_EVENT',
      name: 'Test',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };

    expect(() => getTestPayloadFromTrigger({ trigger })).toThrow(
      'Select a test record on the trigger to test a database event workflow',
    );
  });

  it('builds a record event payload for a database event trigger', () => {
    const trigger: WorkflowTrigger = {
      type: 'DATABASE_EVENT',
      name: 'Test',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };
    const databaseEventTestRecord = {
      id: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      name: 'Airbnb',
    } as unknown as ObjectRecord;

    expect(
      getTestPayloadFromTrigger({ trigger, databaseEventTestRecord }),
    ).toEqual({
      recordId: databaseEventTestRecord.id,
      properties: { after: databaseEventTestRecord },
    });
  });
});
