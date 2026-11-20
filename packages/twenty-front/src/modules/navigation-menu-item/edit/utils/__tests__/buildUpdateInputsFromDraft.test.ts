import { NavigationMenuItemType } from 'twenty-shared/types';

import { buildUpdateInputsFromDraft } from '@/navigation-menu-item/edit/utils/buildUpdateInputsFromDraft';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const HIDDEN_SECTION: NavigationMenuItem = {
  id: 'hidden-section',
  type: NavigationMenuItemType.SECTION,
  name: 'Workspace',
  position: 0,
  isActive: false,
  createdAt: '2026-11-19T00:00:00.000Z',
  updatedAt: '2026-11-19T00:00:00.000Z',
};

describe('buildUpdateInputsFromDraft', () => {
  it('should send isActive when a hidden item is restored', () => {
    expect(
      buildUpdateInputsFromDraft({
        draft: [{ ...HIDDEN_SECTION, isActive: true }],
        workspaceItemsById: new Map([[HIDDEN_SECTION.id, HIDDEN_SECTION]]),
        idsToRecreateSet: new Set(),
        resolveFolderId: (draftFolderId) => draftFolderId,
      }),
    ).toEqual([{ id: 'hidden-section', update: { isActive: true } }]);
  });

  it('should send nothing for an unchanged item', () => {
    expect(
      buildUpdateInputsFromDraft({
        draft: [HIDDEN_SECTION],
        workspaceItemsById: new Map([[HIDDEN_SECTION.id, HIDDEN_SECTION]]),
        idsToRecreateSet: new Set(),
        resolveFolderId: (draftFolderId) => draftFolderId,
      }),
    ).toEqual([]);
  });
});
