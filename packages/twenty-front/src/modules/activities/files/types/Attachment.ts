import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { type AttachmentFileCategory } from './AttachmentFileCategory';

export type { AttachmentFileCategory };

export type Attachment = {
  id: string;
  name: string;
  fullPath: string;
  fileCategory: AttachmentFileCategory;
  file?: FieldFilesValue[] | null;
  companyId?: string | null;
  personId?: string | null;
  taskId?: string | null;
  noteId?: string | null;
  opportunityId?: string | null;
  dashboardId?: string | null;
  workflowId?: string | null;
  targetCompanyId?: string | null;
  targetPersonId?: string | null;
  targetTaskId?: string | null;
  targetNoteId?: string | null;
  targetOpportunityId?: string | null;
  targetDashboardId?: string | null;
  targetWorkflowId?: string | null;
  createdBy?: {
    source: string;
    workspaceMemberId: string | null;
    name: string;
  };
  createdAt: string;
  __typename: string;
};
