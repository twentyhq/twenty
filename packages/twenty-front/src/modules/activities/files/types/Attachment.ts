export type Attachment = {
  id: string;
  name: string;
  fullPath: string;
  type: AttachmentType;
  companyId: string;
  personId: string;
  createdBy: {
    source: string;
    workspaceMemberId: string;
    name: string;
  };
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
