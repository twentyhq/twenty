import { describe, expect, it } from 'vitest';

import { computeGranolaFolderSelection } from 'src/front-components/utils/compute-granola-folder-selection.util';

const FOLDERS = [
  { id: 'fol_sales', name: 'Sales', parent_folder_id: null },
  { id: 'fol_support', name: 'Support', parent_folder_id: null },
];

describe('computeGranolaFolderSelection', () => {
  it('syncs everything when no folder is stored', () => {
    expect(
      computeGranolaFolderSelection({
        folders: FOLDERS,
        selectedFolderIds: [],
        pendingFolderIds: undefined,
      }),
    ).toEqual({
      selectedFolderIds: [],
      policy: 'ALL_FOLDERS',
      hasInaccessibleSelection: false,
      isSelectionPending: false,
    });
  });

  it('restores the stored folders that are still accessible', () => {
    expect(
      computeGranolaFolderSelection({
        folders: FOLDERS,
        selectedFolderIds: ['fol_sales', 'fol_removed'],
        pendingFolderIds: undefined,
      }),
    ).toEqual({
      selectedFolderIds: ['fol_sales'],
      policy: 'SELECTED_FOLDERS',
      hasInaccessibleSelection: false,
      isSelectionPending: false,
    });
  });

  it('prefers a selection that is not applied in Granola yet', () => {
    expect(
      computeGranolaFolderSelection({
        folders: FOLDERS,
        selectedFolderIds: ['fol_sales'],
        pendingFolderIds: ['fol_support'],
      }),
    ).toEqual({
      selectedFolderIds: ['fol_support'],
      policy: 'SELECTED_FOLDERS',
      hasInaccessibleSelection: false,
      isSelectionPending: true,
    });
  });

  it('flags a stored selection whose folders are all gone', () => {
    expect(
      computeGranolaFolderSelection({
        folders: FOLDERS,
        selectedFolderIds: ['fol_removed'],
        pendingFolderIds: undefined,
      }),
    ).toEqual({
      selectedFolderIds: [],
      policy: 'SELECTED_FOLDERS',
      hasInaccessibleSelection: true,
      isSelectionPending: false,
    });
  });
});
