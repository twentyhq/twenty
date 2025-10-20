export type Attachment = {
  id: string;
  name: string;
  fullPath: string;
  fileCategory: AttachmentFileCategory;
  companyId: string;
  personId: string;
  // Deprecated: Use createdBy instead
  authorId?: string;
  createdBy?: {
    source: string;
    workspaceMemberId: string | null;
    name: string;
  };
  createdAt: string;
  __typename: string;
};

export type AttachmentFileCategory =
  | 'ARCHIVE'
  | 'AUDIO'
  | 'IMAGE'
  | 'PRESENTATION'
  | 'SPREADSHEET'
  | 'TEXT_DOCUMENT'
  | 'VIDEO'
  | 'OTHER';
