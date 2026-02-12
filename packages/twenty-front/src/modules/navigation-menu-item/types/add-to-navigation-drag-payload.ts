export type AddToNavigationDragPayloadObject = {
  type: 'object';
  objectMetadataId: string;
  defaultViewId: string;
  label: string;
};

export type AddToNavigationDragPayloadView = {
  type: 'view';
  viewId: string;
  label: string;
};

export type AddToNavigationDragPayloadRecord = {
  type: 'record';
  recordId: string;
  objectMetadataId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

export type AddToNavigationDragPayloadFolder = {
  type: 'folder';
  folderId: string;
  name: string;
};

export type AddToNavigationDragPayloadLink = {
  type: 'link';
  linkId: string;
  name: string;
  link: string;
};

export type AddToNavigationDragPayload =
  | AddToNavigationDragPayloadObject
  | AddToNavigationDragPayloadView
  | AddToNavigationDragPayloadRecord
  | AddToNavigationDragPayloadFolder
  | AddToNavigationDragPayloadLink;
