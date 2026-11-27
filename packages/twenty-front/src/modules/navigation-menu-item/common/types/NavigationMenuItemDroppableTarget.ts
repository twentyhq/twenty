export type NavigationMenuItemDroppableTarget = {
  kind: 'root' | 'tabOrSectionList' | 'folder' | 'folderHeader';
  parentId: string | null;
};
