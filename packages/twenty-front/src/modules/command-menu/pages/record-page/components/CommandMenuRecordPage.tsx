import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { RecordShowEffect } from '@/object-record/record-show/components/RecordShowEffect';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';

const StyledRightDrawerRecord = styled.div<{ isMobile: boolean }>`
  height: ${({ theme, isMobile }) =>
    isMobile ? `calc(100% - ${theme.spacing(16)})` : '100%'};
`;

export const CommandMenuRecordPage = () => {
  const isMobile = useIsMobile();

  const viewableRecordNameSingular = useRecoilComponentValueV2(
    viewableRecordNameSingularComponentState,
  );

  const viewableRecordId = useRecoilComponentValueV2(
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

  const commandMenuPageInstanceId = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  )?.instanceId;

  if (!commandMenuPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider
      value={{ instanceId: `record-show-${objectRecordId}` }}
    >
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: `record-show-${objectRecordId}` }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: `record-show-${objectRecordId}` }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{
              instanceId: commandMenuPageInstanceId,
            }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{ instanceId: commandMenuPageInstanceId }}
            >
              <StyledRightDrawerRecord isMobile={isMobile}>
                <TimelineActivityContext.Provider
                  value={{
                    recordId: objectRecordId,
                  }}
                >
                  <RecordShowEffect
                    objectNameSingular={objectNameSingular}
                    recordId={objectRecordId}
                  />
                  <RecordShowContainer
                    objectNameSingular={objectNameSingular}
                    objectRecordId={objectRecordId}
                    loading={false}
                    isInRightDrawer={true}
                  />
                </TimelineActivityContext.Provider>
              </StyledRightDrawerRecord>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
