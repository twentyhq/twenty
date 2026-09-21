import { getWorkflowCurrentVersion } from '@/workflow/utils/getWorkflowCurrentVersion';

const buildVersion = (status: string, createdAt: string) => ({
  id: `${status}-${createdAt}`,
  status,
  createdAt,
});

describe('getWorkflowCurrentVersion', () => {
  it('prefers a draft, then an active version, then the newest version', () => {
    const deactivatedVersion = buildVersion(
      'DEACTIVATED',
      '2026-09-18T12:00:00.000Z',
    );
    const activeVersion = buildVersion('ACTIVE', '2026-09-18T11:00:00.000Z');
    const draftVersion = buildVersion('DRAFT', '2026-09-18T10:00:00.000Z');

    expect(
      getWorkflowCurrentVersion([
        draftVersion,
        activeVersion,
        deactivatedVersion,
      ]),
    ).toEqual(draftVersion);
    expect(
      getWorkflowCurrentVersion([activeVersion, deactivatedVersion]),
    ).toEqual(activeVersion);
    expect(getWorkflowCurrentVersion([deactivatedVersion])).toEqual(
      deactivatedVersion,
    );
  });
});
