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
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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

type PageLayoutInitializationQueryEffectProps = {
  pageLayoutId: string;
  onInitialized?: (pageLayout: PageLayout) => void;
};

export const PageLayoutInitializationQueryEffect = ({
  pageLayoutId,
  onInitialized,
}: PageLayoutInitializationQueryEffectProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const isDefaultLayout =
    pageLayoutId === DEFAULT_RECORD_PAGE_LAYOUT_ID ||
    pageLayoutId === DEFAULT_COMPANY_RECORD_PAGE_LAYOUT_ID ||
    pageLayoutId === DEFAULT_PERSON_RECORD_PAGE_LAYOUT_ID ||
    pageLayoutId === DEFAULT_OPPORTUNITY_RECORD_PAGE_LAYOUT_ID ||
    pageLayoutId === DEFAULT_NOTE_RECORD_PAGE_LAYOUT_ID ||
    pageLayoutId === DEFAULT_TASK_RECORD_PAGE_LAYOUT_ID ||
    pageLayoutId === DEFAULT_WORKFLOW_PAGE_LAYOUT_ID ||
    pageLayoutId === DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID ||
    pageLayoutId === DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID;

  const { data } = useQuery(FIND_ONE_PAGE_LAYOUT, {
    variables: {
      id: pageLayoutId,
    },
    skip: isDefaultLayout,
  });

  const pageLayout: PageLayout | undefined = isDefaultLayout
    ? getDefaultLayoutById(pageLayoutId)
    : data?.getPageLayout
      ? transformPageLayout(data.getPageLayout)
      : undefined;

  const pageLayoutPersistedComponentCallbackState =
    useRecoilComponentCallbackState(pageLayoutPersistedComponentState);

  const pageLayoutDraftComponentCallbackState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
  );

  const pageLayoutCurrentLayoutsComponentCallbackState =
    useRecoilComponentCallbackState(pageLayoutCurrentLayoutsComponentState);

  const initializePageLayout = useRecoilCallback(
    ({ set, snapshot }) =>
      (layout: PageLayout) => {
        const currentPersisted = getSnapshotValue(
          snapshot,
          pageLayoutPersistedComponentCallbackState,
        );

        if (!isDeeplyEqual(layout, currentPersisted)) {
          set(pageLayoutPersistedComponentCallbackState, layout);
          set(pageLayoutDraftComponentCallbackState, {
            id: layout.id,
            name: layout.name,
            type: layout.type,
            objectMetadataId: layout.objectMetadataId,
            tabs: layout.tabs,
          });

          const tabLayouts = convertPageLayoutToTabLayouts(layout);
          set(pageLayoutCurrentLayoutsComponentCallbackState, tabLayouts);
        }
      },
    [
      pageLayoutCurrentLayoutsComponentCallbackState,
      pageLayoutDraftComponentCallbackState,
      pageLayoutPersistedComponentCallbackState,
    ],
  );

  useEffect(() => {
    if (!isInitialized && isDefined(pageLayout)) {
      initializePageLayout(pageLayout);
      onInitialized?.(pageLayout);
      setIsInitialized(true);
    }
  }, [initializePageLayout, isInitialized, pageLayout, onInitialized]);

  return null;
};
