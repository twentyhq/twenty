import { getWorkflowCurrentVersion } from '@/workflow/utils/getWorkflowCurrentVersion';

const buildVersion = (status: string, createdAt: string) => ({
  id: `${status}-${createdAt}`,
  status,
  createdAt,
});

describe('getWorkflowCurrentVersion', () => {
  it('prefers a draft, then an active version, over the last published version', () => {
    const deactivatedVersion = buildVersion(
      'DEACTIVATED',
      '2026-09-18T12:00:00.000Z',
    );
    const activeVersion = buildVersion('ACTIVE', '2026-09-18T11:00:00.000Z');
    const draftVersion = buildVersion('DRAFT', '2026-09-18T10:00:00.000Z');

    expect(
      getWorkflowCurrentVersion({
        versions: [draftVersion, activeVersion, deactivatedVersion],
        lastPublishedVersionId: activeVersion.id,
      }),
    ).toEqual(draftVersion);
    expect(
      getWorkflowCurrentVersion({
        versions: [activeVersion, deactivatedVersion],
        lastPublishedVersionId: deactivatedVersion.id,
      }),
    ).toEqual(activeVersion);
    expect(
      getWorkflowCurrentVersion({
        versions: [deactivatedVersion],
        lastPublishedVersionId: null,
      }),
    ).toEqual(deactivatedVersion);
  });

  it('prefers the last published version when versions share the same createdAt', () => {
    const deactivatedVersion = buildVersion(
      'DEACTIVATED',
      '2026-07-17T10:00:00.000Z',
    );
    const archivedVersion = buildVersion(
      'ARCHIVED',
      '2026-07-17T10:00:00.000Z',
    );

    expect(
      getWorkflowCurrentVersion({
        versions: [archivedVersion, deactivatedVersion],
        lastPublishedVersionId: deactivatedVersion.id,
      }),
    ).toEqual(deactivatedVersion);
  });

  it('falls back to the newest version when the last published version is unknown', () => {
    const olderArchivedVersion = buildVersion(
      'ARCHIVED',
      '2026-09-18T10:00:00.000Z',
    );
    const newerArchivedVersion = buildVersion(
      'ARCHIVED',
      '2026-09-18T11:00:00.000Z',
    );

    expect(
      getWorkflowCurrentVersion({
        versions: [olderArchivedVersion, newerArchivedVersion],
        lastPublishedVersionId: 'missing-version-id',
      }),
    ).toEqual(newerArchivedVersion);
  });
});
