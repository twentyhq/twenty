export const getNavigationMenuAddSectionDropdownId = (
  parentId: string | null,
) => `navigation-menu-add-section-${parentId ?? 'home'}`;
