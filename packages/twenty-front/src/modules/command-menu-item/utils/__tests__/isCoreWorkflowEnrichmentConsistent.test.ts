import { isCoreWorkflowEnrichmentConsistent } from '@/command-menu-item/utils/isCoreWorkflowEnrichmentConsistent';

const buildCoreWorkflow = ({
  id,
  workspaceWorkflowId,
}: {
  id: string;
  workspaceWorkflowId: string | null;
}) => ({
  id,
  workspaceWorkflowId,
});

describe('isCoreWorkflowEnrichmentConsistent', () => {
  it('accepts a result whose workspace id matches the selected record', () => {
    expect(
      isCoreWorkflowEnrichmentConsistent({
        selectedWorkflowRecords: [
          { id: 'workspace-1', coreWorkflowId: 'core-1' },
        ],
        coreWorkflows: [
          buildCoreWorkflow({
            id: 'core-1',
            workspaceWorkflowId: 'workspace-1',
          }),
        ],
      }),
    ).toBe(true);
  });

  it('rejects a stale pointer that resolves to another workflow', () => {
    expect(
      isCoreWorkflowEnrichmentConsistent({
        selectedWorkflowRecords: [
          { id: 'workspace-1', coreWorkflowId: 'core-2' },
        ],
        coreWorkflows: [
          buildCoreWorkflow({
            id: 'core-2',
            workspaceWorkflowId: 'workspace-2',
          }),
        ],
      }),
    ).toBe(false);
  });

  it('rejects a record whose pointer resolved to nothing', () => {
    expect(
      isCoreWorkflowEnrichmentConsistent({
        selectedWorkflowRecords: [
          { id: 'workspace-1', coreWorkflowId: 'core-1' },
        ],
        coreWorkflows: [],
      }),
    ).toBe(false);
  });

  it('accepts an empty selection', () => {
    expect(
      isCoreWorkflowEnrichmentConsistent({
        selectedWorkflowRecords: [],
        coreWorkflows: [],
      }),
    ).toBe(true);
  });
});
