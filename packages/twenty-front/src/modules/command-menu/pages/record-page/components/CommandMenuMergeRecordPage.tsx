import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { MergeRecordsContainer } from '@/object-record/record-merge/components/MergeRecordsContainer';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import styled from '@emotion/styled';

const StyledRightDrawerRecord = styled.div<{
  isMobile: boolean;
}>`
  height: ${({ theme, isMobile }) => {
    const mobileOffset = isMobile ? theme.spacing(16) : '0px';

    return `calc(100% - ${mobileOffset})`;
  }};
`;

export const CommandMenuMergeRecordPage = () => {
  const isMobile = useIsMobile();

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const commandMenuPageInstanceId = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  )?.instanceId;

  if (!commandMenuPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider
      value={{ instanceId: `record-merge-${commandMenuPageInstanceId}` }}
    >
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: `record-merge-${commandMenuPageInstanceId}` }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: `record-merge-${commandMenuPageInstanceId}` }}
        >
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{ instanceId: commandMenuPageInstanceId }}
            >
              <StyledRightDrawerRecord isMobile={isMobile}>
                <MergeRecordsContainer
                  objectNameSingular={objectMetadataItem.nameSingular}
                  componentInstanceId={commandMenuPageInstanceId}
                />
              </StyledRightDrawerRecord>
            </ActionMenuComponentInstanceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
