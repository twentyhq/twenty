import { type WorkflowStep } from '@/workflow/types/Workflow';
import { isWorkflowDiagramSeedCurrent } from '@/workflow/workflow-diagram/utils/isWorkflowDiagramSeedCurrent';
import { type WorkflowVersionContent } from '@/workflow/workflow-version/hooks/useWorkflowVersionContent';

const SEEDED_CONTENT: WorkflowVersionContent = {
  workflowVersionId: 'version-id',
  trigger: null,
  steps: [],
};

const CONTENT_WITH_NEW_STEP: WorkflowVersionContent = {
  ...SEEDED_CONTENT,
  steps: [{ id: 'step-id' } as WorkflowStep],
};

describe('isWorkflowDiagramSeedCurrent', () => {
  it('should keep the seed when the version and its updatedAt are unchanged', () => {
    expect(
      isWorkflowDiagramSeedCurrent({
        seededVersionId: 'version-id',
        seededVersionUpdatedAt: 'first-update',
        seededContent: SEEDED_CONTENT,
        content: SEEDED_CONTENT,
        contentUpdatedAt: 'first-update',
      }),
    ).toBe(true);
  });

  it('should keep the seed when only the updatedAt moved ahead of the content', () => {
    expect(
      isWorkflowDiagramSeedCurrent({
        seededVersionId: 'version-id',
        seededVersionUpdatedAt: 'first-update',
        seededContent: SEEDED_CONTENT,
        content: { ...SEEDED_CONTENT, steps: [] },
        contentUpdatedAt: 'second-update',
      }),
    ).toBe(true);
  });

  it('should reseed when the content arrives after its updatedAt was already cached', () => {
    expect(
      isWorkflowDiagramSeedCurrent({
        seededVersionId: 'version-id',
        seededVersionUpdatedAt: 'first-update',
        seededContent: SEEDED_CONTENT,
        content: CONTENT_WITH_NEW_STEP,
        contentUpdatedAt: 'second-update',
      }),
    ).toBe(false);
  });

  it('should reseed when another version is selected', () => {
    expect(
      isWorkflowDiagramSeedCurrent({
        seededVersionId: 'other-version-id',
        seededVersionUpdatedAt: 'first-update',
        seededContent: SEEDED_CONTENT,
        content: SEEDED_CONTENT,
        contentUpdatedAt: 'first-update',
      }),
    ).toBe(false);
  });

  it('should reseed when the seed was reset for a refetch', () => {
    expect(
      isWorkflowDiagramSeedCurrent({
        seededVersionId: undefined,
        seededVersionUpdatedAt: undefined,
        seededContent: SEEDED_CONTENT,
        content: SEEDED_CONTENT,
        contentUpdatedAt: undefined,
      }),
    ).toBe(false);
  });
});
