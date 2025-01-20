import { useRecoilValue } from 'recoil';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';

const StyledRightDrawerRecord = styled.div<{ isMobile: boolean }>`
  height: ${({ theme, isMobile }) =>
    isMobile ? `calc(100% - ${theme.spacing(16)})` : '100%'};
`;

export const RightDrawerRecord = () => {
  const isMobile = useIsMobile();

  const viewableRecordNameSingular = useRecoilValue(
    viewableRecordNameSingularState,
  );
  const isNewViewableRecordLoading = useRecoilValue(
    isNewViewableRecordLoadingState,
  );
  const viewableRecordId = useRecoilValue(viewableRecordIdState);

  if (!viewableRecordNameSingular && !isNewViewableRecordLoading) {
    throw new Error(`Object name is not defined`);
  }

  if (!viewableRecordId && !isNewViewableRecordLoading) {
    throw new Error(`Record id is not defined`);
  }

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    viewableRecordNameSingular ?? '',
    viewableRecordId ?? '',
  );

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{
        instanceId: `record-show-${objectRecordId}`,
      }}
    >
      <ActionMenuComponentInstanceContext.Provider
        value={{ instanceId: `record-show-${objectRecordId}` }}
      >
        <StyledRightDrawerRecord isMobile={isMobile}>
          <RecordFieldValueSelectorContextProvider>
            {!isNewViewableRecordLoading && (
              <RecordValueSetterEffect recordId={objectRecordId} />
            )}
            <RecordShowContainer
              objectNameSingular={objectNameSingular}
              objectRecordId={objectRecordId}
              loading={false}
              isInRightDrawer={true}
              isNewRightDrawerItemLoading={isNewViewableRecordLoading}
            />
          </RecordFieldValueSelectorContextProvider>
        </StyledRightDrawerRecord>
      </ActionMenuComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
