import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { selectCurrentCoreWorkflowVersion } from 'src/engine/core-modules/workflow/utils/select-current-core-workflow-version.util';

const buildVersion = ({
  id,
  status,
  createdAt,
}: {
  id: string;
  status: WorkflowVersionStatus;
  createdAt: string;
}) => ({
  id,
  status,
  createdAt,
});

describe('selectCurrentCoreWorkflowVersion', () => {
  it('prefers the draft version over a newer published one', () => {
    const current = selectCurrentCoreWorkflowVersion([
      buildVersion({
        id: 'published',
        status: WorkflowVersionStatus.ACTIVE,
        createdAt: '2026-01-03',
      }),
      buildVersion({
        id: 'draft',
        status: WorkflowVersionStatus.DRAFT,
        createdAt: '2026-01-01',
      }),
    ]);

    expect(current?.id).toBe('draft');
  });

  it('prefers the newest draft when several drafts exist', () => {
    const current = selectCurrentCoreWorkflowVersion([
      buildVersion({
        id: 'old-draft',
        status: WorkflowVersionStatus.DRAFT,
        createdAt: '2026-01-01',
      }),
      buildVersion({
        id: 'new-draft',
        status: WorkflowVersionStatus.DRAFT,
        createdAt: '2026-01-02',
      }),
    ]);

    expect(current?.id).toBe('new-draft');
  });

  it('falls back to the newest version when there is no draft', () => {
    const current = selectCurrentCoreWorkflowVersion([
      buildVersion({
        id: 'old',
        status: WorkflowVersionStatus.ARCHIVED,
        createdAt: '2026-01-01',
      }),
      buildVersion({
        id: 'new',
        status: WorkflowVersionStatus.ACTIVE,
        createdAt: '2026-01-03',
      }),
    ]);

    expect(current?.id).toBe('new');
  });

  it('returns nothing for a workflow with no versions', () => {
    expect(selectCurrentCoreWorkflowVersion([])).toBeUndefined();
  });
});
