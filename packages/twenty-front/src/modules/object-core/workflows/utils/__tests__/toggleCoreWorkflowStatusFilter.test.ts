import { toggleCoreWorkflowStatusFilter } from '@/object-core/workflows/utils/toggleCoreWorkflowStatusFilter';
import { CoreWorkflowStatus } from '~/generated/graphql';

describe('toggleCoreWorkflowStatusFilter', () => {
  it('should add a status that is not selected', () => {
    expect(
      toggleCoreWorkflowStatusFilter(
        [CoreWorkflowStatus.DRAFT],
        CoreWorkflowStatus.ACTIVE,
      ),
    ).toEqual([CoreWorkflowStatus.DRAFT, CoreWorkflowStatus.ACTIVE]);
  });

  it('should remove a status that is already selected', () => {
    expect(
      toggleCoreWorkflowStatusFilter(
        [CoreWorkflowStatus.DRAFT, CoreWorkflowStatus.ACTIVE],
        CoreWorkflowStatus.DRAFT,
      ),
    ).toEqual([CoreWorkflowStatus.ACTIVE]);
  });

  it('should not mutate the given statuses', () => {
    const statuses = [CoreWorkflowStatus.DRAFT];

    toggleCoreWorkflowStatusFilter(statuses, CoreWorkflowStatus.DRAFT);
    toggleCoreWorkflowStatusFilter(statuses, CoreWorkflowStatus.ACTIVE);

    expect(statuses).toEqual([CoreWorkflowStatus.DRAFT]);
  });
});
