import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { INFORMATION_BANNER_HEIGHT } from '@/information-banner/constants/InformationBannerHeight';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { PageLayoutDispatcher } from '@/object-record/record-show/components/PageLayoutDispatcher';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledRightDrawerRecord = styled.div<{
  isMobile: boolean;
  hasDeletedRecordBanner: boolean;
}>`
  height: ${({ theme, isMobile, hasDeletedRecordBanner }) => {
    const mobileOffset = isMobile ? theme.spacing(16) : '0px';
    const bannerOffset = hasDeletedRecordBanner
      ? INFORMATION_BANNER_HEIGHT
      : '0px';
    return `calc(100% - ${mobileOffset} - ${bannerOffset})`;
  }};
`;

export const CommandMenuRecordPage = () => {
  const isMobile = useIsMobile();

  const viewableRecordNameSingular = useRecoilComponentValue(
    viewableRecordNameSingularComponentState,
  );

  const viewableRecordId = useRecoilComponentValue(
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

  const recordDeletedAt = useRecoilValue(
    recordStoreFamilySelector({
      recordId: objectRecordId,
      fieldName: 'deletedAt',
    }),
  );

  const commandMenuPageInstanceId = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  )?.instanceId;

  if (!commandMenuPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={`record-show-${objectRecordId}`}
    >
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: commandMenuPageInstanceId,
        }}
      >
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: commandMenuPageInstanceId }}
        >
          <StyledRightDrawerRecord
            isMobile={isMobile}
            hasDeletedRecordBanner={!!recordDeletedAt}
          >
            <TimelineActivityContext.Provider
              value={{
                recordId: objectRecordId,
              }}
            >
              <PageLayoutDispatcher
                targetRecordIdentifier={{
                  id: objectRecordId,
                  targetObjectNameSingular: objectNameSingular,
                }}
                isInRightDrawer
              />
            </TimelineActivityContext.Provider>
          </StyledRightDrawerRecord>
        </ActionMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
