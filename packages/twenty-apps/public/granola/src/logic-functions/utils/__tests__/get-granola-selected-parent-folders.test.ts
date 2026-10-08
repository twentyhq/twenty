import { describe, expect, it } from 'vitest';

import { getGranolaSelectedParentFolders } from 'src/logic-functions/utils/get-granola-selected-parent-folders.util';

const folders = [
  { id: 'root', parent_folder_id: null },
  { id: 'child', parent_folder_id: 'root' },
  { id: 'grandchild', parent_folder_id: 'child' },
  { id: 'other', parent_folder_id: null },
];

describe('getGranolaSelectedParentFolders', () => {
  it('removes duplicates and descendants already covered by a selected parent', () => {
    expect(
      getGranolaSelectedParentFolders({
        folderIds: ['grandchild', 'root', 'root', 'other'],
        folders,
      }),
    ).toEqual(['root', 'other']);
  });

  it('preserves selected children when their parent was not selected', () => {
    expect(
      getGranolaSelectedParentFolders({ folderIds: ['grandchild'], folders }),
    ).toEqual(['grandchild']);
  });

  it('keeps an empty selection empty to clear the filter', () => {
    expect(getGranolaSelectedParentFolders({ folderIds: [], folders })).toEqual(
      [],
    );
  });

  it('preserves explicit selections when cyclic ancestry would clear the filter', () => {
    expect(
      getGranolaSelectedParentFolders({
        folderIds: ['first', 'second'],
        folders: [
          { id: 'first', parent_folder_id: 'second' },
          { id: 'second', parent_folder_id: 'first' },
        ],
      }),
    ).toEqual(['first', 'second']);
  });

  it('prunes a folder whose selected ancestor sits before a cycle in its chain', () => {
    expect(
      getGranolaSelectedParentFolders({
        folderIds: ['leaf', 'branch'],
        folders: [
          { id: 'leaf', parent_folder_id: 'loop' },
          { id: 'loop', parent_folder_id: 'branch' },
          { id: 'branch', parent_folder_id: 'loop' },
        ],
      }),
    ).toEqual(['branch']);
  });
});
