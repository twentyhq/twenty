import { parseWorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/utils/parse-workspace-data-export-state.util';

const validState = {
  workspaceName: 'Acme',
  tables: [
    {
      nameSingular: 'company',
      labelSingular: 'Company',
      tableName: 'company',
      fieldCount: 1,
      columns: [{ name: 'id', isText: false }],
    },
  ],
  partsByTable: { company: [{ name: 'company-00000.csv', recordCount: 3 }] },
  completedTableCount: 1,
  startedAt: 1,
  heartbeatAt: 2,
};

describe('parseWorkspaceDataExportState', () => {
  it('returns the state when it matches the schema', () => {
    expect(parseWorkspaceDataExportState(JSON.stringify(validState))).toEqual(
      validState,
    );
  });

  it('returns undefined for a state written in another shape', () => {
    expect(
      parseWorkspaceDataExportState(
        JSON.stringify({ ...validState, partsByTable: undefined }),
      ),
    ).toBeUndefined();
  });

  it('returns undefined for content that is not JSON', () => {
    expect(parseWorkspaceDataExportState('not json')).toBeUndefined();
  });
});
