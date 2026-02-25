import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultCompanyRecordPageLayoutId';
import { DEFAULT_NOTE_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultNoteRecordPageLayoutId';
import { DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultOpportunityRecordPageLayoutId';
import { DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultPersonRecordPageLayoutId';
import { DEFAULT_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultRecordPageLayoutId';
import { DEFAULT_TASK_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultTaskRecordPageLayoutId';
import { DEFAULT_WORKFLOW_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowPageLayoutId';
import { DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowRunPageLayoutId';
import { DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowVersionPageLayoutId';

const OBJECT_NAME_TO_DEFAULT_LAYOUT_ID: Record<string, string> = {
  [CoreObjectNameSingular.Company]: DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.Person]: DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.Opportunity]:
    DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.Note]: DEFAULT_NOTE_RECORD_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.Task]: DEFAULT_TASK_RECORD_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.Workflow]: DEFAULT_WORKFLOW_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.WorkflowVersion]:
    DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.WorkflowRun]: DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID,
};

export const getDefaultRecordPageLayoutId = ({
  targetObjectNameSingular,
}: {
  targetObjectNameSingular: string;
}): string => {
  return (
    OBJECT_NAME_TO_DEFAULT_LAYOUT_ID[targetObjectNameSingular] ??
    DEFAULT_RECORD_PAGE_LAYOUT_ID
  );
};
