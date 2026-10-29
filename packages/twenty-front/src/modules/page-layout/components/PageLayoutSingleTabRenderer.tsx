import { useMemo } from 'react';
import { styled } from '@linaria/react';

import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { RecordFilterValueDependenciesContext } from '@/object-record/record-filter/contexts/RecordFilterValueDependenciesContext';
import { RecordIdentifierBarCreatedAt } from '@/object-record/record-show/components/RecordIdentifierBarCreatedAt';
import { RecordIdentifierBarTitle } from '@/object-record/record-show/components/RecordIdentifierBarTitle';
import { PageLayoutWidgetDndProvider } from '@/page-layout/components/dnd/PageLayoutWidgetDndProvider';
import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutEditModeProvider } from '@/page-layout/components/PageLayoutEditModeProvider';
import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';
import { PageLayoutRecordPageCustomizationSessionRegistrationEffect } from '@/page-layout/components/PageLayoutRecordPageCustomizationSessionRegistrationEffect';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { getTabPresentation } from '@/page-layout/utils/getTabPresentation';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { RecordTableWidgetViewDraftsInitializationEffect } from '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftsInitializationEffect';
import { PageLayoutSidePanelTargetProvider } from '@/side-panel/pages/page-layout/components/PageLayoutSidePanelTargetProvider';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledRecordIdentifierBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  height: ${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px;
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[6]};
  width: 100%;
`;

const StyledRecordIdentifierBarLeft = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledRecordIdentifierBarRight = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
`;

type PageLayoutSingleTabRendererProps = {
  pageLayoutId: string;
};

export const PageLayoutSingleTabRenderer = ({
  pageLayoutId,
}: PageLayoutSingleTabRendererProps) => {
  const { layoutType, targetRecordIdentifier } = useLayoutRenderingContext();

  const pageLayoutComponentInstanceId = pageLayoutId;

  const tabListInstanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    getTabListInstanceIdFromPageLayoutAndRecord({
      pageLayoutId: pageLayoutComponentInstanceId,
      targetRecordIdentifier,
    }),
  );

  const recordFilterValueDependencies = useMemo(
    () => ({
      currentRecord:
        layoutType === PageLayoutType.RECORD_PAGE &&
        isDefined(targetRecordIdentifier)
          ? {
              id: targetRecordIdentifier.id,
              objectMetadataNameSingular:
                targetRecordIdentifier.targetObjectNameSingular,
            }
          : undefined,
    }),
    [layoutType, targetRecordIdentifier],
  );

  return (
    <RecordFilterValueDependenciesContext.Provider
      value={recordFilterValueDependencies}
    >
      <PageLayoutComponentInstanceContext.Provider
        value={{
          instanceId: pageLayoutComponentInstanceId,
        }}
      >
        <TabListComponentInstanceContext.Provider
          value={{
            instanceId: tabListInstanceId,
          }}
        >
          <PageLayoutSidePanelTargetProvider
            pageLayoutId={pageLayoutComponentInstanceId}
            targetRecordIdentifier={targetRecordIdentifier}
          >
            <PageLayoutEditModeProvider
              layoutType={layoutType}
              pageLayoutId={pageLayoutId}
            >
              <PageLayoutInitializationQueryEffect
                pageLayoutId={pageLayoutId}
              />
              <PageLayoutRecordPageCustomizationSessionRegistrationEffect />
              <RecordTableWidgetViewDraftsInitializationEffect />
              <PageLayoutSingleTabRendererContent />
            </PageLayoutEditModeProvider>
          </PageLayoutSidePanelTargetProvider>
        </TabListComponentInstanceContext.Provider>
      </PageLayoutComponentInstanceContext.Provider>
    </RecordFilterValueDependenciesContext.Provider>
  );
};

const PageLayoutSingleTabRendererContent = () => {
  const { layoutType } = useLayoutRenderingContext();
  const targetRecord = useTargetRecord();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const pageLayout = useCurrentPageLayoutOrThrow();

  const sortedTabs = useMemo(
    () => sortTabsByPosition(pageLayout.tabs),
    [pageLayout.tabs],
  );

  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(
    sortedTabs?.[0]?.id,
  );

  const tabLayoutMode = getTabLayoutMode(activeTab.layoutMode);
  const tabPresentation = getTabPresentation(activeTab.presentation);

  const isPageLayoutInitialized = useAtomComponentStateValue(
    pageLayoutIsInitializedComponentState,
  );

  const showRecordIdentifierBar =
    layoutType === PageLayoutType.RECORD_PAGE &&
    !isPageLayoutInEditMode &&
    isDefined(targetRecord);

  return (
    <PageLayoutWidgetDndProvider>
      <PageLayoutContentProvider
        layoutMode={tabLayoutMode}
        presentation={tabPresentation}
      >
        {showRecordIdentifierBar && (
          <StyledRecordIdentifierBar>
            <StyledRecordIdentifierBarLeft>
              <RecordIdentifierBarTitle />
            </StyledRecordIdentifierBarLeft>
            <StyledRecordIdentifierBarRight>
              <RecordIdentifierBarCreatedAt />
            </StyledRecordIdentifierBarRight>
          </StyledRecordIdentifierBar>
        )}
        {isPageLayoutInitialized && (
          <PageLayoutContent pageLayoutTab={activeTab} />
        )}
      </PageLayoutContentProvider>
    </PageLayoutWidgetDndProvider>
  );
};
