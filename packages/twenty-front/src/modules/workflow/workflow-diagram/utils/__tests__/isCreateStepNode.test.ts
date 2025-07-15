import { WorkflowDiagramNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isCreateStepNode } from '../isCreateStepNode';

describe('isCreateStepNode', () => {
  it('should return true for create-step node with correct type and nodeType', () => {
    const createStepNode: WorkflowDiagramNode = {
      id: 'create-step-1',
      type: 'create-step',
      position: { x: 0, y: 200 },
      data: {
        nodeType: 'create-step',
        parentNodeId: 'action-1',
      },
    };

    const result = isCreateStepNode(createStepNode);

    expect(result).toBe(true);
  });

  it('should return false for node with create-step type but wrong nodeType', () => {
    const node: WorkflowDiagramNode = {
      id: 'fake-create-step',
      type: 'create-step',
      position: { x: 0, y: 200 },
      data: {
        nodeType: 'action',
        actionType: 'CREATE_RECORD',
        name: 'Create Company',
      } as any,
    };

    const result = isCreateStepNode(node);

    expect(result).toBe(false);
  });

  it('should return false for node with correct nodeType but wrong type', () => {
    const node: WorkflowDiagramNode = {
      id: 'fake-create-step',
      type: 'action',
      position: { x: 0, y: 200 },
      data: {
        nodeType: 'create-step',
        parentNodeId: 'action-1',
      } as any,
    };

    const result = isCreateStepNode(node);

    expect(result).toBe(false);
  });

  it('should return false for action node', () => {
    const actionNode: WorkflowDiagramNode = {
      id: 'action-1',
      position: { x: 0, y: 100 },
      data: {
        nodeType: 'action',
        actionType: 'CREATE_RECORD',
        name: 'Create Company',
      },
    };

    const result = isCreateStepNode(actionNode);

    expect(result).toBe(false);
  });

  it('should return false for trigger node', () => {
    const triggerNode: WorkflowDiagramNode = {
      id: 'trigger',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'trigger',
        triggerType: 'DATABASE_EVENT',
        name: 'Company Created',
        icon: 'IconPlus',
      },
    };

    const result = isCreateStepNode(triggerNode);

    expect(result).toBe(false);
  });

  it('should return false for empty-trigger node', () => {
    const emptyTriggerNode: WorkflowDiagramNode = {
      id: 'empty-trigger',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'empty-trigger',
      },
    };

    const result = isCreateStepNode(emptyTriggerNode);

    expect(result).toBe(false);
  });

  it('should handle create-step node with additional properties', () => {
    const createStepNodeWithExtras: WorkflowDiagramNode = {
      id: 'create-step-with-extras',
      type: 'create-step',
      position: { x: 50, y: 250 },
      selected: true,
      data: {
        nodeType: 'create-step',
        parentNodeId: 'action-2',
      },
    };

    const result = isCreateStepNode(createStepNodeWithExtras);

    expect(result).toBe(true);
  });

  it('should return false for node without type property', () => {
    const nodeWithoutType: WorkflowDiagramNode = {
      id: 'node-without-type',
      position: { x: 0, y: 200 },
      data: {
        nodeType: 'create-step',
        parentNodeId: 'action-1',
      } as any,
    };

    const result = isCreateStepNode(nodeWithoutType);

    expect(result).toBe(false);
  });
});
