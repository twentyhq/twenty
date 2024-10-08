import { useRecoilValue } from 'recoil';

import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';

const StyledRightDrawerRecord = styled.div`
  height: ${({ theme }) =>
    useIsMobile() ? `calc(100% - ${theme.spacing(16)})` : '100%'};
`;

export const RightDrawerRecord = () => {
  const viewableRecordNameSingular = useRecoilValue(
    viewableRecordNameSingularState,
  );
  const viewableRecordId = useRecoilValue(viewableRecordIdState);
  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    viewableRecordNameSingular ?? '',
    viewableRecordId ?? '',
  );

  return (
    <StyledRightDrawerRecord>
      <RecordFieldValueSelectorContextProvider>
        <RecordValueSetterEffect recordId={objectRecordId} />
        <RecordShowContainer
          objectNameSingular={objectNameSingular}
          objectRecordId={objectRecordId}
          loading={false}
          isInRightDrawer={true}
        />
      </RecordFieldValueSelectorContextProvider>
    </StyledRightDrawerRecord>
  );
};
