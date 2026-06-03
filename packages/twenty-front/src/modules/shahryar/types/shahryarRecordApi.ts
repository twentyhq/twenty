export type ShahryarRecordApiSection = {
  path: string;
  canCreate?: boolean;
  rows: string[][];
};

export type ShahryarCreateRecordRequest = {
  path: string;
  values: Record<string, string>;
};

export type ShahryarCreateRecordResponse = {
  id: string;
  path: string;
  row: string[];
  createdAt: string;
};

export type ShahryarPhotoUploadTargetType = 'market' | 'visit';

export type ShahryarPhotoUploadRequest = {
  file: File;
  targetId: string;
  targetType: ShahryarPhotoUploadTargetType;
  capturedAt: string;
};

export type ShahryarPhotoUploadResponse = {
  fileId: string;
  filename: string;
  targetType: ShahryarPhotoUploadTargetType;
  targetId: string;
  associatedAt: string;
  url: string;
};
