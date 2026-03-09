import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { INFORMATION_BANNER_HEIGHT } from '@/information-banner/constants/InformationBannerHeight';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const StyledSidePanelRecord = styled.div<{
  hasDeletedRecordBanner: boolean;
}>`
  height: ${({ hasDeletedRecordBanner }) => {
    const bannerOffset = hasDeletedRecordBanner
      ? INFORMATION_BANNER_HEIGHT
      : '0px';
    return `calc(100% - ${bannerOffset})`;
  }};
`;

export const SidePanelRecordPage = () => {
  const viewableRecordNameSingular = useAtomComponentStateValue(
    viewableRecordNameSingularComponentState,
  );

  const viewableRecordId = useAtomComponentStateValue(
    viewableRecordIdComponentState,
  );

  if (!viewableRecordNameSingular) {
    throw new Error('Object name is not defined');
  }

  if (!viewableRecordId) {
    throw new Error('Record id is not defined');
  }

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    viewableRecordNameSingular,
    viewableRecordId,
  );

  const recordDeletedAt = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    {
      recordId: objectRecordId,
      fieldName: 'deletedAt',
    },
  );

  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  if (!sidePanelPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={`record-show-${objectRecordId}`}
    >
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: sidePanelPageInstanceId,
        }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: sidePanelPageInstanceId }}
        >
          <StyledSidePanelRecord hasDeletedRecordBanner={!!recordDeletedAt}>
            <TimelineActivityContext.Provider
              value={{
                recordId: objectRecordId,
              }}
            >
              <PageLayoutRecordPageRenderer
                targetRecordIdentifier={{
                  id: objectRecordId,
                  targetObjectNameSingular: objectNameSingular,
                }}
                isInSidePanel
              />
            </TimelineActivityContext.Provider>
          </StyledSidePanelRecord>
        </CommandMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
