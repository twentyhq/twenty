import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';

describe('getTriggerDefaultLabel', () => {
  describe('DATABASE_EVENT triggers', () => {
    it('returns "Record is created" for created event', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        name: 'Company Created',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
        },
      };

      const result = getTriggerDefaultLabel(trigger);

      expect(result).toBe(DatabaseTriggerDefaultLabel.RECORD_IS_CREATED);
    });

    it('returns "Record is updated" for updated event', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        name: 'Company Updated',
        settings: {
          eventName: 'company.updated',
          outputSchema: {},
        },
      };

      const result = getTriggerDefaultLabel(trigger);

      expect(result).toBe(DatabaseTriggerDefaultLabel.RECORD_IS_UPDATED);
    });

    it('returns "Record is deleted" for deleted event', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        name: 'Company Deleted',
        settings: {
          eventName: 'company.deleted',
          outputSchema: {},
        },
      };

      const result = getTriggerDefaultLabel(trigger);

      expect(result).toBe(DatabaseTriggerDefaultLabel.RECORD_IS_DELETED);
    });

    it('works with different object types', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        name: 'Person Created',
        settings: {
          eventName: 'person.created',
          outputSchema: {},
        },
      };

      const result = getTriggerDefaultLabel(trigger);

      expect(result).toBe(DatabaseTriggerDefaultLabel.RECORD_IS_CREATED);
    });

    it('throws error for unknown database event', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        name: 'Unknown Event',
        settings: {
          eventName: 'company.unknown',
          outputSchema: {},
        },
      };

      expect(() => getTriggerDefaultLabel(trigger)).toThrow(
        'Unknown trigger event',
      );
    });
  });

  describe('MANUAL triggers', () => {
    it('returns "Launch manually" for manual trigger', () => {
      const trigger: WorkflowTrigger = {
        type: 'MANUAL',
        name: 'Manual Trigger',
        settings: {
          objectType: 'company',
          outputSchema: {},
          icon: 'IconHandMove',
        },
      };

      const result = getTriggerDefaultLabel(trigger);

      expect(result).toBe('Launch manually');
    });
  });

  describe('CRON triggers', () => {
    it('returns "On a schedule" for cron trigger', () => {
      const trigger: WorkflowTrigger = {
        type: 'CRON',
        name: 'Scheduled Trigger',
        settings: {
          type: 'DAYS',
          schedule: {
            day: 1,
            hour: 9,
            minute: 0,
          },
          outputSchema: {},
        },
      };

      const result = getTriggerDefaultLabel(trigger);

      expect(result).toBe('On a schedule');
    });
  });

  describe('WEBHOOK triggers', () => {
    it('returns "Webhook" for webhook trigger with GET method', () => {
      const trigger: WorkflowTrigger = {
        type: 'WEBHOOK',
        name: 'Webhook Trigger',
        settings: {
          httpMethod: 'GET',
          authentication: null,
          outputSchema: {},
        },
      };

      const result = getTriggerDefaultLabel(trigger);

      expect(result).toBe('Webhook');
    });

    it('returns "Webhook" for webhook trigger with POST method', () => {
      const trigger: WorkflowTrigger = {
        type: 'WEBHOOK',
        name: 'Webhook Trigger',
        settings: {
          httpMethod: 'POST',
          expectedBody: {
            message: 'Workflow was started',
          },
          authentication: null,
          outputSchema: {
            message: {
              icon: 'IconVariable',
              isLeaf: true,
              label: 'message',
              type: 'string',
              value: 'Workflow was started',
            },
          },
        },
      };

      const result = getTriggerDefaultLabel(trigger);

      expect(result).toBe('Webhook');
    });
  });

  describe('error cases', () => {
    it('throws error for unknown trigger type', () => {
      const trigger = {
        type: 'UNKNOWN_TYPE',
        name: 'Unknown Trigger',
        settings: {
          outputSchema: {},
        },
      } as unknown as WorkflowTrigger;

      expect(() => getTriggerDefaultLabel(trigger)).toThrow(
        'Unknown trigger type',
      );
    });
  });
});
