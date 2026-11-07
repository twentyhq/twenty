import { WORKSPACE_DATA_EXPORT_STALE_AFTER_MS } from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { isWorkspaceDataExportStale } from 'src/engine/core-modules/workspace-data-export/utils/is-workspace-data-export-stale.util';

describe('isWorkspaceDataExportStale', () => {
  it('treats an export without state as stale', () => {
    expect(isWorkspaceDataExportStale(undefined)).toBe(true);
  });

  it('keeps an export with a recent heartbeat', () => {
    expect(isWorkspaceDataExportStale({ heartbeatAt: Date.now() })).toBe(false);
  });

  it('treats an export whose heartbeat is too old as stale', () => {
    expect(
      isWorkspaceDataExportStale({
        heartbeatAt: Date.now() - WORKSPACE_DATA_EXPORT_STALE_AFTER_MS - 1,
      }),
    ).toBe(true);
  });
});
