import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { getWorkflowDiagramTriggerNode } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramTriggerNode';

describe('getWorkflowDiagramTriggerNode', () => {
  describe('MANUAL trigger type', () => {
    it('should create trigger node with default label when trigger name is not provided', () => {
      const trigger: WorkflowTrigger = {
        type: 'MANUAL',
        settings: {
          objectType: 'person',
          outputSchema: {},
          icon: 'IconUser',
        },
      };

      const result = getWorkflowDiagramTriggerNode({ trigger });

      expect(result).toMatchInlineSnapshot(`
{
  "data": {
    "hasNextStepIds": false,
    "icon": "IconUser",
    "name": "Manual trigger",
    "nodeType": "trigger",
    "position": {
      "x": 0,
      "y": 0,
    },
    "stepId": "trigger",
    "triggerType": "MANUAL",
  },
  "id": "trigger",
  "position": {
    "x": 0,
    "y": 0,
  },
}
`);
    });
  });

  describe('CRON trigger type', () => {
    it('should create trigger node for CRON trigger', () => {
      const trigger: WorkflowTrigger = {
        type: 'CRON',
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

      const result = getWorkflowDiagramTriggerNode({ trigger });

      expect(result).toMatchInlineSnapshot(`
        {
          "data": {
            "hasNextStepIds": false,
            "icon": "IconClock",
            "name": "On a schedule",
            "nodeType": "trigger",
            "position": {
              "x": 0,
              "y": 0,
            },
            "stepId": "trigger",
            "triggerType": "CRON",
          },
          "id": "trigger",
          "position": {
            "x": 0,
            "y": 0,
          },
        }
      `);
    });
  });

  describe('WEBHOOK trigger type', () => {
    it('should create trigger node for WEBHOOK trigger', () => {
      const trigger: WorkflowTrigger = {
        type: 'WEBHOOK',
        settings: {
          httpMethod: 'POST',
          outputSchema: {},
          expectedBody: {},
          authentication: 'API_KEY',
        },
      };

      const result = getWorkflowDiagramTriggerNode({ trigger });

      expect(result).toMatchInlineSnapshot(`
        {
          "data": {
            "hasNextStepIds": false,
            "icon": "IconWebhook",
            "name": "Webhook",
            "nodeType": "trigger",
            "position": {
              "x": 0,
              "y": 0,
            },
            "stepId": "trigger",
            "triggerType": "WEBHOOK",
          },
          "id": "trigger",
          "position": {
            "x": 0,
            "y": 0,
          },
        }
      `);
    });
  });

  describe('DATABASE_EVENT trigger type', () => {
    it('should create trigger node for DATABASE_EVENT trigger with created event', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
          objectType: 'company',
        },
      };

      const result = getWorkflowDiagramTriggerNode({ trigger });

      expect(result).toMatchInlineSnapshot(`
        {
          "data": {
            "hasNextStepIds": false,
            "icon": "IconPlaylistAdd",
            "name": "Record is created",
            "nodeType": "trigger",
            "position": {
              "x": 0,
              "y": 0,
            },
            "stepId": "trigger",
            "triggerType": "DATABASE_EVENT",
          },
          "id": "trigger",
          "position": {
            "x": 0,
            "y": 0,
          },
        }
      `);
    });

    it('should create trigger node with empty label for DATABASE_EVENT trigger with unknown event', () => {
      const trigger: WorkflowTrigger = {
        type: 'DATABASE_EVENT',
        settings: {
          eventName: 'company.unknownEvent',
          outputSchema: {},
          objectType: 'company',
        },
      };

      const result = getWorkflowDiagramTriggerNode({ trigger });

      expect(result).toMatchInlineSnapshot(`
        {
          "data": {
            "hasNextStepIds": false,
            "icon": undefined,
            "name": "",
            "nodeType": "trigger",
            "position": {
              "x": 0,
              "y": 0,
            },
            "stepId": "trigger",
            "triggerType": "DATABASE_EVENT",
          },
          "id": "trigger",
          "position": {
            "x": 0,
            "y": 0,
          },
        }
      `);
    });
  });

  describe('custom trigger name', () => {
    it('should use custom name when trigger name is provided', () => {
      const trigger: WorkflowTrigger = {
        type: 'MANUAL',
        name: 'Custom Trigger Name',
        settings: {
          objectType: 'person',
          outputSchema: {},
          icon: 'IconUser',
        },
      };

      const result = getWorkflowDiagramTriggerNode({ trigger });

      expect(result).toMatchInlineSnapshot(`
{
  "data": {
    "hasNextStepIds": false,
    "icon": "IconUser",
    "name": "Custom Trigger Name",
    "nodeType": "trigger",
    "position": {
      "x": 0,
      "y": 0,
    },
    "stepId": "trigger",
    "triggerType": "MANUAL",
  },
  "id": "trigger",
  "position": {
    "x": 0,
    "y": 0,
  },
}
`);
    });
  });

  describe('default case', () => {
    it('should throw error for unsupported trigger type', () => {
      const trigger = {
        type: 'UNSUPPORTED_TYPE',
        settings: {},
      } as unknown as WorkflowTrigger;

      expect(() => getWorkflowDiagramTriggerNode({ trigger })).toThrow(
        'Expected the trigger "{"type":"UNSUPPORTED_TYPE","settings":{}}" to be supported.',
      );
    });
  });
});
