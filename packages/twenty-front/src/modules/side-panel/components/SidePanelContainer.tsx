import { styled } from '@linaria/react';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSidePanelContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-height: ${({ isMobile }) => {
    const mobileOffset = isMobile ? themeCssVariables.spacing[16] : '0px';

    return `calc(100% - ${mobileOffset})`;
  }};
`;

type SidePanelContainerProps = {
  children: React.ReactNode;
};

export const SidePanelContainer = ({ children }: SidePanelContainerProps) => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    SIDE_PANEL_COMPONENT_INSTANCE_ID,
  );
  const isMobile = useIsMobile();

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === contextStoreCurrentObjectMetadataItemId,
  );

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    SIDE_PANEL_COMPONENT_INSTANCE_ID,
  );

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem?.namePlural ?? '',
    contextStoreCurrentViewId ?? '',
  );

  return (
    <RecordComponentInstanceContextsWrapper componentInstanceId={recordIndexId}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID }}
        >
          <StyledSidePanelContainer isMobile={isMobile}>
            {children}
          </StyledSidePanelContainer>
        </CommandMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
