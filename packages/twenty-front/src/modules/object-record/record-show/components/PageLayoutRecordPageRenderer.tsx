import { RecordPageSidePanelCommandMenu } from '@/command-menu-item/components/RecordPageSidePanelCommandMenu';
import { RecordShowSidePanelOpenRecordButton } from '@/command-menu-item/components/RecordShowSidePanelOpenRecordButton';
import { InformationBannerDeletedRecord } from '@/information-banner/components/deleted-record/InformationBannerDeletedRecord';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { RecordShowEffect } from '@/object-record/record-show/components/RecordShowEffect';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { usePageLayoutIdForRecord } from '@/page-layout/hooks/usePageLayoutIdForRecord';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledShowPageBannerContainer = styled.div`
  z-index: 1;
`;

const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: start;
  overflow: auto;
  width: 100%;
`;

const StyledContentContainer = styled.div<{ isInSidePanel: boolean }>`
  background: ${themeCssVariables.background.primary};
  flex: 1;
  overflow-y: auto;
`;

export const PageLayoutRecordPageRenderer = ({
  targetRecordIdentifier,
  isInSidePanel,
}: {
  targetRecordIdentifier: TargetRecordIdentifier;
  isInSidePanel: boolean;
}) => {
  const recordDeletedAt = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    {
      recordId: targetRecordIdentifier.id,
      fieldName: 'deletedAt',
    },
  ) as string | null;

  const { pageLayoutId } = usePageLayoutIdForRecord({
    id: targetRecordIdentifier.id,
    targetObjectNameSingular: targetRecordIdentifier.targetObjectNameSingular,
  });

  const sidePanelWidgetFooterCommandMenuItems = useAtomStateValue(
    sidePanelWidgetFooterCommandMenuItemsState,
  );

  const pinnedWidgetCommandMenuItems =
    sidePanelWidgetFooterCommandMenuItems.filter(
      (commandMenuItem) => commandMenuItem.isPinned !== false,
    );

  const hasPinnedWidgetCommandMenuItems =
    pinnedWidgetCommandMenuItems.length > 0;

  return (
    <>
      <RecordShowEffect
        objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
        recordId={targetRecordIdentifier.id}
      />

      <RecordShowContainerContextStoreTargetedRecordsEffect
        recordId={targetRecordIdentifier.id}
      />

      {recordDeletedAt && (
        <StyledShowPageBannerContainer>
          <InformationBannerDeletedRecord
            recordId={targetRecordIdentifier.id}
            objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
          />
        </StyledShowPageBannerContainer>
      )}

      <StyledShowPageRightContainer>
        <StyledContentContainer isInSidePanel={isInSidePanel}>
          <LayoutRenderingProvider
            value={{
              targetRecordIdentifier: {
                id: targetRecordIdentifier.id,
                targetObjectNameSingular:
                  targetRecordIdentifier.targetObjectNameSingular,
              },
              layoutType:
                targetRecordIdentifier.targetObjectNameSingular ===
                CoreObjectNameSingular.Dashboard
                  ? PageLayoutType.DASHBOARD
                  : PageLayoutType.RECORD_PAGE,
              isInSidePanel,
            }}
          >
            {isDefined(pageLayoutId) && (
              <PageLayoutRenderer pageLayoutId={pageLayoutId} />
            )}
          </LayoutRenderingProvider>
        </StyledContentContainer>

        {isInSidePanel && (
          <SidePanelFooter
            actions={[
              <RecordPageSidePanelCommandMenu key="options" />,
              ...(hasPinnedWidgetCommandMenuItems
                ? pinnedWidgetCommandMenuItems.map((commandMenuItem) => (
                    <Button
                      key={commandMenuItem.id}
                      size="small"
                      variant={
                        commandMenuItem.isPrimaryCTA ? 'primary' : 'secondary'
                      }
                      accent={commandMenuItem.isPrimaryCTA ? 'blue' : 'default'}
                      title={commandMenuItem.label}
                      Icon={commandMenuItem.Icon}
                      hotkeys={commandMenuItem.hotkeys}
                      onClick={commandMenuItem.onClick}
                      disabled={commandMenuItem.disabled}
                    />
                  ))
                : [
                    <RecordShowSidePanelOpenRecordButton
                      key="open"
                      objectNameSingular={
                        targetRecordIdentifier.targetObjectNameSingular
                      }
                      recordId={targetRecordIdentifier.id}
                    />,
                  ]),
            ]}
          />
        )}
      </StyledShowPageRightContainer>
    </>
  );
};
