import { type WorkflowDiagramNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isStepNode } from '@/workflow/workflow-diagram/utils/isStepNode';

describe('isStepNode', () => {
  it('should return true for trigger node', () => {
    const triggerNode: WorkflowDiagramNode = {
      id: 'trigger',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'trigger',
        triggerType: 'DATABASE_EVENT',
        name: 'Company Created',
        icon: 'IconPlus',
        stepId: 'trigger',
        hasNextStepIds: false,
        position: { x: 0, y: 0 },
      },
    };

    const result = isStepNode(triggerNode);

    expect(result).toBe(true);
  });

  it('should return true for action node', () => {
    const actionNode: WorkflowDiagramNode = {
      id: 'action-1',
      position: { x: 0, y: 100 },
      data: {
        nodeType: 'action',
        actionType: 'CREATE_RECORD',
        name: 'Create Company',
        stepId: 'action-1',
        hasNextStepIds: false,
        position: { x: 0, y: 0 },
      },
    };

    const result = isStepNode(actionNode);

    expect(result).toBe(true);
  });

  it('should return false for empty-trigger node', () => {
    const emptyTriggerNode: WorkflowDiagramNode = {
      id: 'empty-trigger',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'empty-trigger',
        position: { x: 0, y: 0 },
      },
    };

    const result = isStepNode(emptyTriggerNode);

    expect(result).toBe(false);
  });

  it('should handle nodes with additional properties', () => {
    const nodeWithExtra: WorkflowDiagramNode = {
      id: 'trigger-with-extra',
      position: { x: 50, y: 50 },
      selected: true,
      data: {
        nodeType: 'trigger',
        triggerType: 'MANUAL',
        name: 'Manual Trigger',
        icon: 'IconClick',
        stepId: 'trigger-with-extra',
        hasNextStepIds: false,
        position: { x: 0, y: 0 },
      },
    };

    const result = isStepNode(nodeWithExtra);

    expect(result).toBe(true);
  });
});
