import { RecordBoardHiddenRelationGroupsPlaceholder } from '@/object-record/record-board/components/RecordBoardHiddenRelationGroupsPlaceholder';
import { RecordBoardLoadingSkeletonColumns } from '@/object-record/record-board/components/RecordBoardLoadingSkeletonColumns';
import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledColumnContainer = styled.div`
  display: flex;
  flex: 1;

  & > *:not(:first-of-type) {
    border-left: 1px solid ${themeCssVariables.border.color.light};
  }
`;

export const RecordBoardColumns = () => {
  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  const recordIndexRecordGroupsAreInInitialLoading = useAtomComponentStateValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const shouldShowSkeletonColumns =
    recordIndexRecordGroupsAreInInitialLoading &&
    visibleRecordGroupIds.length === 0;

  return (
    <StyledColumnContainer>
      {shouldShowSkeletonColumns ? (
        <RecordBoardLoadingSkeletonColumns />
      ) : (
        <>
          {visibleRecordGroupIds.map((recordGroupId, index) => (
            <RecordBoardColumn
              key={recordGroupId}
              recordBoardColumnId={recordGroupId}
              recordBoardColumnIndex={index}
            />
          ))}
          <RecordBoardHiddenRelationGroupsPlaceholder />
        </>
      )}
    </StyledColumnContainer>
  );
};
