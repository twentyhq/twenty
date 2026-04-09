import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { getTriggerHeaderType } from '@/workflow/workflow-trigger/utils/getTriggerHeaderType';

describe('getTriggerHeaderType', () => {
  describe('DATABASE_EVENT triggers', () => {
    it('returns "Trigger · Record is created" for created event', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        name: 'Company Created',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Record is created');
    });

    it('returns "Trigger · Record is updated" for updated event', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        name: 'Company Updated',
        settings: {
          eventName: 'company.updated',
          outputSchema: {},
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Record is updated');
    });

    it('returns "Trigger · Record is deleted" for deleted event', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        name: 'Company Deleted',
        settings: {
          eventName: 'company.deleted',
          outputSchema: {},
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Record is deleted');
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

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Record is created');
    });
  });

  describe('MANUAL triggers', () => {
    it('returns "Trigger · Manual" for manual trigger', () => {
      const trigger: WorkflowTrigger = {
        type: 'MANUAL',
        name: 'Manual Trigger',
        settings: {
          objectType: 'company',
          outputSchema: {},
          icon: 'IconHandMove',
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Manual');
    });

    it('returns "Trigger · Manual" for manual trigger without objectType', () => {
      const trigger: WorkflowTrigger = {
        type: 'MANUAL',
        name: 'Manual Trigger',
        settings: {
          outputSchema: {},
          icon: 'IconHandMove',
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Manual');
    });
  });

  describe('CRON triggers', () => {
    it('returns "Trigger" for cron trigger with DAYS schedule', () => {
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

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Cron');
    });

    it('returns "Trigger" for cron trigger with HOURS schedule', () => {
      const trigger: WorkflowTrigger = {
        type: 'CRON',
        name: 'Hourly Trigger',
        settings: {
          type: 'HOURS',
          schedule: {
            hour: 2,
            minute: 30,
          },
          outputSchema: {},
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Cron');
    });

    it('returns "Trigger" for cron trigger with MINUTES schedule', () => {
      const trigger: WorkflowTrigger = {
        type: 'CRON',
        name: 'Minutely Trigger',
        settings: {
          type: 'MINUTES',
          schedule: {
            minute: 15,
          },
          outputSchema: {},
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Cron');
    });

    it('returns "Trigger" for cron trigger with CUSTOM schedule', () => {
      const trigger: WorkflowTrigger = {
        type: 'CRON',
        name: 'Custom Trigger',
        settings: {
          type: 'CUSTOM',
          pattern: '0 9 * * 1',
          outputSchema: {},
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Cron');
    });
  });

  describe('WEBHOOK triggers', () => {
    it('returns "Trigger · Webhook" for webhook trigger with GET method', () => {
      const trigger: WorkflowTrigger = {
        type: 'WEBHOOK',
        name: 'Webhook Trigger',
        settings: {
          httpMethod: 'GET',
          authentication: null,
          outputSchema: {},
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Webhook');
    });

    it('returns "Trigger · Webhook" for webhook trigger with POST method', () => {
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

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Webhook');
    });

    it('returns "Trigger · Webhook" for webhook trigger with API_KEY authentication', () => {
      const trigger: WorkflowTrigger = {
        type: 'WEBHOOK',
        name: 'Secure Webhook Trigger',
        settings: {
          httpMethod: 'GET',
          authentication: 'API_KEY',
          outputSchema: {},
        },
      };

      const result = getTriggerHeaderType(trigger);

      expect(result).toBe('Trigger · Webhook');
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

      expect(() => getTriggerHeaderType(trigger)).toThrow(
        'Unknown trigger type',
      );
    });
  });
});
