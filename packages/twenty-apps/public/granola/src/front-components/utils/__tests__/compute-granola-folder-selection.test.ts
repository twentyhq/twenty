import { describe, expect, it } from 'vitest';

import { computeGranolaFolderSelection } from 'src/front-components/utils/compute-granola-folder-selection.util';

describe('computeGranolaFolderSelection', () => {
  it('syncs everything when no folder is stored', () => {
    expect(
      computeGranolaFolderSelection({
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

  it('restores the stored folders', () => {
    expect(
      computeGranolaFolderSelection({
        selectedFolderIds: ['fol_sales', 'fol_support'],
        pendingFolderIds: undefined,
      }),
    ).toEqual({
      selectedFolderIds: ['fol_sales', 'fol_support'],
      policy: 'SELECTED_FOLDERS',
      hasInaccessibleSelection: false,
      isSelectionPending: false,
    });
  });

  it('prefers a selection that is not applied in Granola yet', () => {
    expect(
      computeGranolaFolderSelection({
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

  it('marks a pending switch back to everything', () => {
    expect(
      computeGranolaFolderSelection({
        selectedFolderIds: ['fol_sales'],
        pendingFolderIds: [],
      }),
    ).toEqual({
      selectedFolderIds: [],
      policy: 'ALL_FOLDERS',
      hasInaccessibleSelection: false,
      isSelectionPending: true,
    });
  });
});
