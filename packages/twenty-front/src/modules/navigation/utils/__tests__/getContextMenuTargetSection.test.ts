import { NavigationMenuItemType } from 'twenty-shared/types';

import { getContextMenuTargetSection } from '@/navigation/utils/getContextMenuTargetSection';

const CUSTOM_SECTION = {
  id: 'custom-section',
  type: NavigationMenuItemType.SECTION,
  builtInSectionKey: null,
};

const FAVORITES_SECTION = {
  id: 'favorites-section',
  type: NavigationMenuItemType.SECTION,
  builtInSectionKey: 'favorites',
};

const SECTIONS = [CUSTOM_SECTION, FAVORITES_SECTION];

describe('getContextMenuTargetSection', () => {
  it('should return the right-clicked custom section', () => {
    expect(
      getContextMenuTargetSection({
        sections: SECTIONS,
        targetSectionId: 'custom-section',
      }),
    ).toBe(CUSTOM_SECTION);
  });

  it('should not target a built-in section', () => {
    expect(
      getContextMenuTargetSection({
        sections: SECTIONS,
        targetSectionId: 'favorites-section',
      }),
    ).toBeUndefined();
  });

  it('should not target anything outside a section', () => {
    expect(
      getContextMenuTargetSection({
        sections: SECTIONS,
        targetSectionId: null,
      }),
    ).toBeUndefined();
  });

  it('should not target a section of another tab', () => {
    expect(
      getContextMenuTargetSection({
        sections: SECTIONS,
        targetSectionId: 'other-tab-section',
      }),
    ).toBeUndefined();
  });
});
