import { DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultCompanyRecordPageLayoutId';
import { DEFAULT_MESSAGE_THREAD_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultMessageThreadRecordPageLayoutId';
import { DEFAULT_NOTE_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultNoteRecordPageLayoutId';
import { DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultOpportunityRecordPageLayoutId';
import { DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultPersonRecordPageLayoutId';
import { DEFAULT_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultRecordPageLayoutId';
import { DEFAULT_TASK_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultTaskRecordPageLayoutId';
import { DEFAULT_WORKFLOW_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowPageLayoutId';
import { DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowRunPageLayoutId';
import { DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowVersionPageLayoutId';

const DEFAULT_PAGE_LAYOUT_IDS = new Set<string>([
  DEFAULT_RECORD_PAGE_LAYOUT_ID,
  DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID,
  DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID,
  DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT_ID,
  DEFAULT_NOTE_RECORD_PAGE_LAYOUT_ID,
  DEFAULT_TASK_RECORD_PAGE_LAYOUT_ID,
  DEFAULT_WORKFLOW_PAGE_LAYOUT_ID,
  DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID,
  DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID,
  DEFAULT_MESSAGE_THREAD_RECORD_PAGE_LAYOUT_ID,
]);

export const isDefaultPageLayoutId = (pageLayoutId: string): boolean =>
  DEFAULT_PAGE_LAYOUT_IDS.has(pageLayoutId);
