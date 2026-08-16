export type NavigationMenuItem = {
  id: string;
  userWorkspaceId: string | null;
  targetRecordId: string | null;
  targetObjectMetadataId: string | null;
  viewId: string | null;
  type: string;
  name: string | null;
  link: string | null;
  icon: string | null;
  color: string | null;
  folderId: string | null;
  pageLayoutId: string | null;
  position: number;
};
