import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';

// Mock the getActionIcon function
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon',
  () => ({
    getActionIcon: jest.fn((actionType) => {
      const mockIcons = {
        CREATE_RECORD: 'IconPlus',
        UPDATE_RECORD: 'IconEdit',
        DELETE_RECORD: 'IconTrash',
        SEND_EMAIL: 'IconMail',
        FILTER: 'IconFilter',
      };
      return mockIcons[actionType as keyof typeof mockIcons] || 'IconQuestion';
    }),
  }),
);

const baseNodeData = {
  hasNextStepIds: false,
  position: { x: 0, y: 0 },
  stepId: '',
};

describe('getWorkflowNodeIconKey', () => {
  describe('trigger nodes', () => {
    it('should return the icon from trigger node data', () => {
      const triggerNodeData: WorkflowDiagramStepNodeData = {
        ...baseNodeData,
        nodeType: 'trigger',
        triggerType: 'DATABASE_EVENT',
        name: 'Company Created',
        icon: 'IconDatabase',
      };

      const result = getWorkflowNodeIconKey(triggerNodeData);

      expect(result).toBe('IconDatabase');
    });

    it('should return icon for manual trigger', () => {
      const manualTriggerData: WorkflowDiagramStepNodeData = {
        ...baseNodeData,
        nodeType: 'trigger',
        triggerType: 'MANUAL',
        name: 'Manual Trigger',
        icon: 'IconClick',
      };

      const result = getWorkflowNodeIconKey(manualTriggerData);

      expect(result).toBe('IconClick');
    });

    it('should return icon for webhook trigger', () => {
      const webhookTriggerData: WorkflowDiagramStepNodeData = {
        ...baseNodeData,
        nodeType: 'trigger',
        triggerType: 'WEBHOOK',
        name: 'Webhook Trigger',
        icon: 'IconWebhook',
      };

      const result = getWorkflowNodeIconKey(webhookTriggerData);

      expect(result).toBe('IconWebhook');
    });
  });

  describe('action nodes', () => {
    it('should return icon for CREATE_RECORD action', () => {
      const createActionData: WorkflowDiagramStepNodeData = {
        ...baseNodeData,
        nodeType: 'action',
        actionType: 'CREATE_RECORD',
        name: 'Create Company',
      };

      const result = getWorkflowNodeIconKey(createActionData);

      expect(result).toBe('IconPlus');
    });

    it('should return icon for UPDATE_RECORD action', () => {
      const updateActionData: WorkflowDiagramStepNodeData = {
        ...baseNodeData,
        nodeType: 'action',
        actionType: 'UPDATE_RECORD',
        name: 'Update Company',
      };

      const result = getWorkflowNodeIconKey(updateActionData);

      expect(result).toBe('IconEdit');
    });

    it('should return icon for DELETE_RECORD action', () => {
      const deleteActionData: WorkflowDiagramStepNodeData = {
        ...baseNodeData,
        nodeType: 'action',
        actionType: 'DELETE_RECORD',
        name: 'Delete Company',
      };

      const result = getWorkflowNodeIconKey(deleteActionData);

      expect(result).toBe('IconTrash');
    });

    it('should return icon for SEND_EMAIL action', () => {
      const emailActionData: WorkflowDiagramStepNodeData = {
        ...baseNodeData,
        nodeType: 'action',
        actionType: 'SEND_EMAIL',
        name: 'Send Email',
      };

      const result = getWorkflowNodeIconKey(emailActionData);

      expect(result).toBe('IconMail');
    });

    it('should return icon for FILTER action', () => {
      const filterActionData: WorkflowDiagramStepNodeData = {
        ...baseNodeData,
        nodeType: 'action',
        actionType: 'FILTER',
        name: 'Filter Records',
      };

      const result = getWorkflowNodeIconKey(filterActionData);

      expect(result).toBe('IconFilter');
    });

    it('should handle unknown action types', () => {
      const unknownActionData: WorkflowDiagramStepNodeData = {
        ...baseNodeData,
        nodeType: 'action',
        actionType: 'UNKNOWN_ACTION' as any,
        name: 'Unknown Action',
      };

      const result = getWorkflowNodeIconKey(unknownActionData);

      expect(result).toBe('IconQuestion');
    });
  });
});
