import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { BASE_RECORD_LAYOUT } from '@/object-record/record-show/layouts/base-record-layout';
import { COMPANY_RECORD_LAYOUT } from '@/object-record/record-show/layouts/company-record-layout';
import { NOTE_RECORD_LAYOUT } from '@/object-record/record-show/layouts/note-record-layout';
import { OPPORTUNITY_RECORD_LAYOUT } from '@/object-record/record-show/layouts/opportunity-record-layout';
import { PERSON_RECORD_LAYOUT } from '@/object-record/record-show/layouts/person-record-layout';
import { TASK_RECORD_LAYOUT } from '@/object-record/record-show/layouts/task-record-layout';
import { WORKFLOW_RECORD_LAYOUT } from '@/object-record/record-show/layouts/workflow-record-layout';
import { WORKFLOW_RUN_RECORD_LAYOUT } from '@/object-record/record-show/layouts/workflow-run-record-layout';
import { WORKFLOW_VERSION_RECORD_LAYOUT } from '@/object-record/record-show/layouts/workflow-version-record-layout';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';
import { evaluateTabVisibility } from '@/object-record/record-show/utils/evaluateTabVisibility';
import { type RecordLayoutTab } from '@/ui/layout/tab-list/types/RecordLayoutTab';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { IconHome, useIcons } from 'twenty-ui/display';

// Object-specific layouts that override or extend the base layout
const OBJECT_SPECIFIC_LAYOUTS: Partial<
  Record<CoreObjectNameSingular, RecordLayout>
> = {
  [CoreObjectNameSingular.Note]: NOTE_RECORD_LAYOUT,
  [CoreObjectNameSingular.Task]: TASK_RECORD_LAYOUT,
  [CoreObjectNameSingular.Company]: COMPANY_RECORD_LAYOUT,
  [CoreObjectNameSingular.Person]: PERSON_RECORD_LAYOUT,
  [CoreObjectNameSingular.Opportunity]: OPPORTUNITY_RECORD_LAYOUT,
  [CoreObjectNameSingular.Workflow]: WORKFLOW_RECORD_LAYOUT,
  [CoreObjectNameSingular.WorkflowVersion]: WORKFLOW_VERSION_RECORD_LAYOUT,
  [CoreObjectNameSingular.WorkflowRun]: WORKFLOW_RUN_RECORD_LAYOUT,
};

export const useRecordShowContainerTabs = (
  targetObjectNameSingular: CoreObjectNameSingular,
  isInRightDrawer: boolean,
  objectMetadataItem: ObjectMetadataItem,
): { layout: RecordLayout; tabs: SingleTabProps[] } => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { getIcon } = useIcons();

  // Merge base layout with object-specific layout
  const recordLayout: RecordLayout = useMemo(() => {
    return {
      ...BASE_RECORD_LAYOUT,
      ...(OBJECT_SPECIFIC_LAYOUTS[targetObjectNameSingular] || {}),
      tabs: {
        ...BASE_RECORD_LAYOUT.tabs,
        ...(OBJECT_SPECIFIC_LAYOUTS[targetObjectNameSingular]?.tabs || {}),
      },
    };
  }, [targetObjectNameSingular]);

  return {
    layout: recordLayout,
    tabs: Object.entries(recordLayout.tabs)
      .filter(
        (entry): entry is [string, NonNullable<RecordLayoutTab>] =>
          entry[1] !== null && entry[1] !== undefined,
      )
      .sort(([, a], [, b]) => a.position - b.position)
      .map(([key, { title, icon, hide, cards }]) => {
        const Icon = getIcon(icon);

        // Special handling for fields tab
        if (key === 'fields') {
          return {
            id: key,
            title,
            Icon,
            cards,
            hide:
              !(isMobile || isInRightDrawer) ||
              recordLayout.hideFieldsInSidePanel,
          };
        }

        // Use extracted visibility evaluation logic
        const shouldHide = evaluateTabVisibility(hide, {
          isMobile,
          isInRightDrawer,
          currentWorkspace,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          targetObjectMetadataItem: objectMetadataItem,
        });

        return {
          id: key,
          title,
          Icon,
          cards,
          hide: shouldHide,
        };
      })
      // When isInRightDrawer === true, we merge first and second tab into first tab
      .reduce<SingleTabProps[]>((acc, tab, index, array) => {
        if (isInRightDrawer && array.length > 1) {
          if (index === 0) {
            return [
              ...acc,
              {
                id: 'home',
                title: t`Home`,
                Icon: IconHome,
                cards: [
                  ...(tab.hide ? [] : tab.cards),
                  ...(array[1].hide ? [] : array[1].cards),
                ],
                hide: false,
              },
            ];
          }
          if (index === 1) {
            return acc;
          }
        }
        return [...acc, tab];
      }, []),
  };
};
