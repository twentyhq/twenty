import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { MergeRecordsContainer } from '@/object-record/record-merge/components/MergeRecordsContainer';
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

  const commandMenuPageInstanceId = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  )?.instanceId;

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow(
    commandMenuPageInstanceId,
  );

  if (!commandMenuPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={`record-merge-${commandMenuPageInstanceId}`}
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
            <MergeRecordsContainer
              objectNameSingular={objectMetadataItem.nameSingular}
            />
          </StyledRightDrawerRecord>
        </ActionMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
