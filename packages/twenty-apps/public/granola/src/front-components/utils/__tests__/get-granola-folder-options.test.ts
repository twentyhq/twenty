import { describe, expect, it } from 'vitest';

import { getGranolaFolderOptions } from 'src/front-components/utils/get-granola-folder-options.util';

describe('getGranolaFolderOptions', () => {
  it('orders folders as a tree with their ancestry even when children precede parents', () => {
    expect(
      getGranolaFolderOptions([
        { id: 'child', name: 'Calls', parent_folder_id: 'parent' },
        { id: 'root', name: 'Sales', parent_folder_id: null },
        { id: 'parent', name: 'Europe', parent_folder_id: 'root' },
      ]),
    ).toEqual([
      { id: 'root', name: 'Sales', path: 'Sales', depth: 0, ancestorIds: [] },
      {
        id: 'parent',
        name: 'Europe',
        path: 'Sales / Europe',
        depth: 1,
        ancestorIds: ['root'],
      },
      {
        id: 'child',
        name: 'Calls',
        path: 'Sales / Europe / Calls',
        depth: 2,
        ancestorIds: ['parent', 'root'],
      },
    ]);
  });

  it('keeps a child under its parent when a sibling name sorts between them', () => {
    expect(
      getGranolaFolderOptions([
        { id: 'sibling', name: 'Sales - EMEA', parent_folder_id: null },
        { id: 'child', name: 'Europe', parent_folder_id: 'root' },
        { id: 'root', name: 'Sales', parent_folder_id: null },
      ]).map((folder) => folder.path),
    ).toEqual(['Sales', 'Sales / Europe', 'Sales - EMEA']);
  });

  it('keeps inaccessible parents and cyclic provider data finite', () => {
    expect(
      getGranolaFolderOptions([
        { id: 'orphan', name: 'Calls', parent_folder_id: 'missing' },
        { id: 'cycle', name: 'Team', parent_folder_id: 'cycle' },
      ]),
    ).toEqual([
      { id: 'orphan', name: 'Calls', path: 'Calls', depth: 0, ancestorIds: [] },
      { id: 'cycle', name: 'Team', path: 'Team', depth: 0, ancestorIds: [] },
    ]);
  });
});
