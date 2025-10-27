import { type AttachmentFileCategory } from './AttachmentFileCategory';

export type { AttachmentFileCategory };

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
