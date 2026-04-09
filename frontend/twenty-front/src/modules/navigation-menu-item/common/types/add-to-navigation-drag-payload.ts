export type AddToNavigationDragPayloadObject = {
  type: 'OBJECT';
  objectMetadataId: string;
  label: string;
  iconColor?: string;
};

export type AddToNavigationDragPayloadView = {
  type: 'VIEW';
  viewId: string;
  label: string;
};

export type AddToNavigationDragPayloadRecord = {
  type: 'RECORD';
  recordId: string;
  objectMetadataId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

export type AddToNavigationDragPayloadFolder = {
  type: 'FOLDER';
  folderId: string;
  name: string;
};

export type AddToNavigationDragPayloadLink = {
  type: 'LINK';
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
