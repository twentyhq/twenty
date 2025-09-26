export type Attachment = {
  id: string;
  name: string;
  fullPath: string;
  type: AttachmentType;
  companyId: string;
  personId: string;
  authorId: string;
  createdAt: string;
  __typename: string;
};

export type AttachmentType =
  | 'ARCHIVE'
  | 'AUDIO'
  | 'IMAGE'
  | 'PRESENTATION'
  | 'SPREADSHEET'
  | 'TEXT_DOCUMENT'
  | 'VIDEO'
  | 'OTHER';
