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

  it.each([
    { from: undefined, to: 3, expected: 3 },
    { from: 3, to: null, expected: null },
  ])(
    'should send the visible item limit when it changes from $from to $to',
    ({ from, to, expected }) => {
      const section = { ...HIDDEN_SECTION, visibleItemLimit: from };

      expect(
        buildUpdateInputsFromDraft({
          draft: [{ ...section, visibleItemLimit: to }],
          workspaceItemsById: new Map([[section.id, section]]),
          idsToRecreateSet: new Set(),
          resolveFolderId: (draftFolderId) => draftFolderId,
        }),
      ).toEqual([
        { id: 'hidden-section', update: { visibleItemLimit: expected } },
      ]);
    },
  );
});
