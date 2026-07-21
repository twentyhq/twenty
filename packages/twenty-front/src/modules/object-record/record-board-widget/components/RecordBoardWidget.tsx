import { RecordBoardContainer } from '@/object-record/record-board/components/RecordBoardContainer';
import { RecordBoardWidgetViewSettingsReadOnlyEffect } from '@/object-record/record-board-widget/components/RecordBoardWidgetViewSettingsReadOnlyEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBoardContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

type RecordBoardWidgetProps = {
  isReadOnly?: boolean;
};

export const RecordBoardWidget = ({
  isReadOnly = true,
}: RecordBoardWidgetProps) => {
  const { objectNameSingular, recordIndexId, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  return (
    <>
      <RecordBoardWidgetViewSettingsReadOnlyEffect
        recordBoardId={recordIndexId}
        isViewSettingsReadOnly={isReadOnly}
      />
      <StyledBoardContainer>
        <RecordBoardContainer
          recordBoardId={recordIndexId}
          viewBarId={viewBarInstanceId}
          objectNameSingular={objectNameSingular}
        />
      </StyledBoardContainer>
    </>
  );
};
