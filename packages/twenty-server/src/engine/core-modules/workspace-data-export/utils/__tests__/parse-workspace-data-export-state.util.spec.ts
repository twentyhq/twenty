import { FieldMetadataType } from 'twenty-shared/types';

import { parseWorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/utils/parse-workspace-data-export-state.util';

const validState = {
  workspaceName: 'Acme',
  objects: [
    {
      objectMetadataId: 'company-object-id',
      nameSingular: 'company',
      labelSingular: 'Company',
      columns: [{ fieldName: 'id', label: 'Id', type: FieldMetadataType.UUID }],
      fieldCount: 1,
    },
  ],
  partsByObject: { company: [{ name: 'company-00000.csv', recordCount: 3 }] },
  completedObjectCount: 1,
  startedAt: 1,
  heartbeatAt: 2,
};

describe('parseWorkspaceDataExportState', () => {
  it('returns the state when it matches the schema', () => {
    expect(parseWorkspaceDataExportState(JSON.stringify(validState))).toEqual({
      state: validState,
    });
  });

  it('reports why a state written in another shape is rejected', () => {
    const { state, error } = parseWorkspaceDataExportState(
      JSON.stringify({ ...validState, partsByObject: undefined }),
    );

    expect(state).toBeUndefined();
    expect(error).toContain('partsByObject');
  });

  it('reports content that is not JSON', () => {
    const { state, error } = parseWorkspaceDataExportState('not json');

    expect(state).toBeUndefined();
    expect(error).toContain('invalid JSON');
  });
});
