import { getCurrentWorkflowVersionId } from '@/command-menu-item/utils/getCurrentWorkflowVersionId';
import { type Workflow } from '@/workflow/types/Workflow';

const buildWorkflow = (versions: Workflow['versions']): Workflow => ({
  __typename: 'Workflow',
  id: 'workflow-1',
  name: 'My workflow',
  statuses: [],
  lastPublishedVersionId: null,
  versions,
});

const buildVersion = ({
  id,
  status,
  createdAt,
}: {
  id: string;
  status: Workflow['versions'][number]['status'];
  createdAt: string;
}) => ({ id, name: id, status, createdAt });

describe('getCurrentWorkflowVersionId', () => {
  it('prefers the draft version over a newer published one', () => {
    expect(
      getCurrentWorkflowVersionId(
        buildWorkflow([
          buildVersion({
            id: 'published',
            status: 'ACTIVE',
            createdAt: '2026-01-03',
          }),
          buildVersion({
            id: 'draft',
            status: 'DRAFT',
            createdAt: '2026-01-01',
          }),
        ]),
      ),
    ).toBe('draft');
  });

  it('prefers the newest draft when several drafts exist', () => {
    expect(
      getCurrentWorkflowVersionId(
        buildWorkflow([
          buildVersion({
            id: 'old-draft',
            status: 'DRAFT',
            createdAt: '2026-01-01',
          }),
          buildVersion({
            id: 'new-draft',
            status: 'DRAFT',
            createdAt: '2026-01-02',
          }),
        ]),
      ),
    ).toBe('new-draft');
  });

  it('falls back to the newest version when there is no draft', () => {
    expect(
      getCurrentWorkflowVersionId(
        buildWorkflow([
          buildVersion({
            id: 'old',
            status: 'ARCHIVED',
            createdAt: '2026-01-01',
          }),
          buildVersion({
            id: 'new',
            status: 'ACTIVE',
            createdAt: '2026-01-03',
          }),
        ]),
      ),
    ).toBe('new');
  });

  it('returns nothing for a workflow with no versions', () => {
    expect(getCurrentWorkflowVersionId(buildWorkflow([]))).toBeUndefined();
  });
});
