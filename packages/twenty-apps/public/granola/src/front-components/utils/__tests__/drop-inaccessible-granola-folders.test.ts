import { describe, expect, it } from 'vitest';

import { dropInaccessibleGranolaFolders } from 'src/front-components/utils/drop-inaccessible-granola-folders.util';

const FOLDERS = [{ id: 'fol_sales' }, { id: 'fol_support' }];

describe('dropInaccessibleGranolaFolders', () => {
  it('keeps the stored folders that are still accessible', () => {
    expect(
      dropInaccessibleGranolaFolders({
        selection: {
          selectedFolderIds: ['fol_sales', 'fol_removed'],
          policy: 'SELECTED_FOLDERS',
          hasInaccessibleSelection: false,
          isSelectionPending: false,
        },
        folders: FOLDERS,
      }),
    ).toEqual({
      selectedFolderIds: ['fol_sales'],
      policy: 'SELECTED_FOLDERS',
      hasInaccessibleSelection: false,
      isSelectionPending: false,
    });
  });

  it('flags a stored selection whose folders are all gone', () => {
    expect(
      dropInaccessibleGranolaFolders({
        selection: {
          selectedFolderIds: ['fol_removed'],
          policy: 'SELECTED_FOLDERS',
          hasInaccessibleSelection: false,
          isSelectionPending: true,
        },
        folders: FOLDERS,
      }),
    ).toEqual({
      selectedFolderIds: [],
      policy: 'SELECTED_FOLDERS',
      hasInaccessibleSelection: true,
      isSelectionPending: true,
    });
  });

  it('leaves an empty selection alone', () => {
    expect(
      dropInaccessibleGranolaFolders({
        selection: {
          selectedFolderIds: [],
          policy: 'SELECTED_FOLDERS',
          hasInaccessibleSelection: false,
          isSelectionPending: false,
        },
        folders: [],
      }),
    ).toEqual({
      selectedFolderIds: [],
      policy: 'SELECTED_FOLDERS',
      hasInaccessibleSelection: false,
      isSelectionPending: false,
    });
  });
});
