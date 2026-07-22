import { styled } from '@linaria/react';

import { useContext, useRef } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordBoardColumnWidthEffect } from '@/object-record/record-board/components/RecordBoardColumnWidthEffect';
import { RecordBoardColumns } from '@/object-record/record-board/components/RecordBoardColumns';
import { RecordBoardDragSelect } from '@/object-record/record-board/components/RecordBoardDragSelect';
import { RecordBoardEffects } from '@/object-record/record-board/components/RecordBoardEffects';
import { RecordBoardFetchMoreInViewTriggerComponent } from '@/object-record/record-board/components/RecordBoardFetchMoreInViewTriggerComponent';
import { RecordBoardHeader } from '@/object-record/record-board/components/RecordBoardHeader';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { getRecordBoardHtmlId } from '@/object-record/record-board/utils/getRecordBoardHtmlId';
import { RecordBoardDndKitProvider } from '@/object-record/record-board/record-board-dnd/providers/RecordBoardDndKitProvider';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 100%;
  position: relative;
`;

const StyledContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: min-content;
  min-height: calc(100% - ${themeCssVariables.spacing[2]});
`;

const StyledBoardContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const RecordBoard = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const boardRef = useRef<HTMLDivElement>(null);

  const isRecordBoardViewSettingsReadOnly = useAtomComponentStateValue(
    isRecordBoardViewSettingsReadOnlyComponentState,
  );

  return (
    <>
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-record-board-${recordBoardId}`}
      >
        <RecordBoardEffects />
        <RecordBoardColumnWidthEffect />
        <StyledContainerContainer id={getRecordBoardHtmlId(recordBoardId)}>
          <RecordBoardHeader />
          <StyledBoardContentContainer>
            <StyledContainer ref={boardRef}>
              <RecordBoardDndKitProvider>
                <RecordBoardColumns />
              </RecordBoardDndKitProvider>
              {!isRecordBoardViewSettingsReadOnly && (
                <RecordBoardDragSelect boardRef={boardRef} />
              )}
              <RecordBoardFetchMoreInViewTriggerComponent />
            </StyledContainer>
          </StyledBoardContentContainer>
        </StyledContainerContainer>
      </ScrollWrapper>
    </>
  );
};
