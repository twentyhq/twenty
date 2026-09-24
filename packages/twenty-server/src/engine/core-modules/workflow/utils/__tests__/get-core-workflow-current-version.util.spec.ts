import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { getCoreWorkflowCurrentVersion } from 'src/engine/core-modules/workflow/utils/get-core-workflow-current-version.util';

const buildVersion = (id: string, status: WorkflowVersionStatus) => ({
  id,
  status,
});

describe('getCoreWorkflowCurrentVersion', () => {
  it('should prefer a draft, then an active version, over the last published version', () => {
    const draftVersion = buildVersion('draft', WorkflowVersionStatus.DRAFT);
    const activeVersion = buildVersion('active', WorkflowVersionStatus.ACTIVE);
    const deactivatedVersion = buildVersion(
      'deactivated',
      WorkflowVersionStatus.DEACTIVATED,
    );

    expect(
      getCoreWorkflowCurrentVersion({
        versionsByRecency: [deactivatedVersion, activeVersion, draftVersion],
        lastPublishedCoreWorkflowVersionId: deactivatedVersion.id,
      }),
    ).toEqual(draftVersion);
    expect(
      getCoreWorkflowCurrentVersion({
        versionsByRecency: [deactivatedVersion, activeVersion],
        lastPublishedCoreWorkflowVersionId: deactivatedVersion.id,
      }),
    ).toEqual(activeVersion);
  });

  it('should prefer the last published version over a newer archived version', () => {
    const archivedVersion = buildVersion(
      'archived',
      WorkflowVersionStatus.ARCHIVED,
    );
    const deactivatedVersion = buildVersion(
      'deactivated',
      WorkflowVersionStatus.DEACTIVATED,
    );

    expect(
      getCoreWorkflowCurrentVersion({
        versionsByRecency: [archivedVersion, deactivatedVersion],
        lastPublishedCoreWorkflowVersionId: deactivatedVersion.id,
      }),
    ).toEqual(deactivatedVersion);
  });

  it('should fall back to the newest version when the last published version is unknown', () => {
    const newerArchivedVersion = buildVersion(
      'newer-archived',
      WorkflowVersionStatus.ARCHIVED,
    );
    const olderArchivedVersion = buildVersion(
      'older-archived',
      WorkflowVersionStatus.ARCHIVED,
    );

    expect(
      getCoreWorkflowCurrentVersion({
        versionsByRecency: [newerArchivedVersion, olderArchivedVersion],
        lastPublishedCoreWorkflowVersionId: null,
      }),
    ).toEqual(newerArchivedVersion);
  });
});
