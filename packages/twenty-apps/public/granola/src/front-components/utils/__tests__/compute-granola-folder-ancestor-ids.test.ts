import { describe, expect, it } from 'vitest';

import { computeGranolaFolderAncestorIds } from 'src/front-components/utils/compute-granola-folder-ancestor-ids.util';

describe('computeGranolaFolderAncestorIds', () => {
  it('lists ancestors nearest first and stays finite on missing parents and cycles', () => {
    const ancestorIds = computeGranolaFolderAncestorIds([
      { id: 'root', name: 'Sales', parent_folder_id: null },
      { id: 'parent', name: 'Europe', parent_folder_id: 'root' },
      { id: 'child', name: 'Calls', parent_folder_id: 'parent' },
      { id: 'orphan', name: 'Old', parent_folder_id: 'missing' },
      { id: 'cycle', name: 'Team', parent_folder_id: 'cycle' },
    ]);

    expect(ancestorIds.get('child')).toEqual(['parent', 'root']);
    expect(ancestorIds.get('root')).toEqual([]);
    expect(ancestorIds.get('orphan')).toEqual([]);
    expect(ancestorIds.get('cycle')).toEqual([]);
  });
});
