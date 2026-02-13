import { FIND_ONE_PAGE_LAYOUT } from '@/dashboards/graphql/queries/findOnePageLayout';
import { DEFAULT_COMPANY_RECORD_PAGE_LAYOUT } from '@/page-layout/constants/DefaultCompanyRecordPageLayout';
import { DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultCompanyRecordPageLayoutId';
import { DEFAULT_NOTE_RECORD_PAGE_LAYOUT } from '@/page-layout/constants/DefaultNoteRecordPageLayout';
import { DEFAULT_NOTE_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultNoteRecordPageLayoutId';
import { DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT } from '@/page-layout/constants/DefaultOpportunityRecordPageLayout';
import { DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultOpportunityRecordPageLayoutId';
import { DEFAULT_PERSON_RECORD_PAGE_LAYOUT } from '@/page-layout/constants/DefaultPersonRecordPageLayout';
import { DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultPersonRecordPageLayoutId';
import { DEFAULT_RECORD_PAGE_LAYOUT } from '@/page-layout/constants/DefaultRecordPageLayout';
import { DEFAULT_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultRecordPageLayoutId';
import { DEFAULT_TASK_RECORD_PAGE_LAYOUT } from '@/page-layout/constants/DefaultTaskRecordPageLayout';
import { DEFAULT_TASK_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultTaskRecordPageLayoutId';
import { DEFAULT_WORKFLOW_PAGE_LAYOUT } from '@/page-layout/constants/DefaultWorkflowPageLayout';
import { DEFAULT_WORKFLOW_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowPageLayoutId';
import { DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT } from '@/page-layout/constants/DefaultWorkflowRunPageLayout';
import { DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowRunPageLayoutId';
import { DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT } from '@/page-layout/constants/DefaultWorkflowVersionPageLayout';
import { DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowVersionPageLayoutId';
import { recordPageLayoutFromIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutFromIdFamilySelector';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useQuery } from '@apollo/client';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const getDefaultLayoutById = (layoutId: string): PageLayout => {
  switch (layoutId) {
    case DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID:
      return DEFAULT_COMPANY_RECORD_PAGE_LAYOUT;
    case DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID:
      return DEFAULT_PERSON_RECORD_PAGE_LAYOUT;
    case DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT_ID:
      return DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT;
    case DEFAULT_NOTE_RECORD_PAGE_LAYOUT_ID:
      return DEFAULT_NOTE_RECORD_PAGE_LAYOUT;
    case DEFAULT_TASK_RECORD_PAGE_LAYOUT_ID:
      return DEFAULT_TASK_RECORD_PAGE_LAYOUT;
    case DEFAULT_WORKFLOW_PAGE_LAYOUT_ID:
      return DEFAULT_WORKFLOW_PAGE_LAYOUT;
    case DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID:
      return DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT;
    case DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID:
      return DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT;
    case DEFAULT_RECORD_PAGE_LAYOUT_ID:
    default:
      return DEFAULT_RECORD_PAGE_LAYOUT;
  }
};

const isDefaultLayoutId = (layoutId: string): boolean =>
  layoutId === DEFAULT_RECORD_PAGE_LAYOUT_ID ||
  layoutId === DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID ||
  layoutId === DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID ||
  layoutId === DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT_ID ||
  layoutId === DEFAULT_NOTE_RECORD_PAGE_LAYOUT_ID ||
  layoutId === DEFAULT_TASK_RECORD_PAGE_LAYOUT_ID ||
  layoutId === DEFAULT_WORKFLOW_PAGE_LAYOUT_ID ||
  layoutId === DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID ||
  layoutId === DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID;

export const useBasePageLayout = (
  pageLayoutId: string,
): PageLayout | undefined => {
  const isDefaultLayout = isDefaultLayoutId(pageLayoutId);

  const cachedRecordPageLayout = useRecoilValue(
    recordPageLayoutFromIdFamilySelector({ pageLayoutId }),
  );

  const shouldSkipQuery = isDefaultLayout || isDefined(cachedRecordPageLayout);

  const { data } = useQuery(FIND_ONE_PAGE_LAYOUT, {
    variables: {
      id: pageLayoutId,
    },
    skip: shouldSkipQuery,
  });

  if (isDefaultLayout) {
    return getDefaultLayoutById(pageLayoutId);
  }

  if (isDefined(cachedRecordPageLayout)) {
    return cachedRecordPageLayout;
  }

  if (isDefined(data?.getPageLayout)) {
    return transformPageLayout(data.getPageLayout);
  }

  return undefined;
};
