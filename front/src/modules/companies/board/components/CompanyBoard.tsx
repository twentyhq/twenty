import styled from '@emotion/styled';

import { BoardContext } from '@/companies/states/contexts/BoardContext';
import { mapBoardFieldDefinitionsToViewFields } from '@/companies/utils/mapBoardFieldDefinitionsToViewFields';
import { BoardOptionsDropdown } from '@/ui/layout/board/components/BoardOptionsDropdown';
import { BoardOptionsDropdownId } from '@/ui/layout/board/components/constants/BoardOptionsDropdownId';
import {
  RecordBoard,
  RecordBoardProps,
} from '@/ui/layout/board/components/RecordBoard';
import { RecordBoardActionBar } from '@/ui/layout/board/components/RecordBoardActionBar';
import { RecordBoardContextMenu } from '@/ui/layout/board/components/RecordBoardContextMenu';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { ViewScope } from '@/views/scopes/ViewScope';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

import { HooksCompanyBoardEffect } from '../../components/HooksCompanyBoardEffect';
import { CompanyBoardRecoilScopeContext } from '../../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  width: 100%;
`;

type CompanyBoardProps = Pick<
  RecordBoardProps,
  'onColumnAdd' | 'onColumnDelete' | 'onEditColumnTitle'
>;

export const CompanyBoard = ({
  onColumnAdd,
  onColumnDelete,
  onEditColumnTitle,
}: CompanyBoardProps) => {
  const viewScopeId = 'company-board-view';

  const { persistViewFields } = useViewFields(viewScopeId);

  return (
    <ViewScope
      viewScopeId={viewScopeId}
      onViewFieldsChange={() => {}}
      onViewFiltersChange={() => {}}
      onViewSortsChange={() => {}}
    >
      <StyledContainer>
        <BoardContext.Provider
          value={{
            BoardRecoilScopeContext: CompanyBoardRecoilScopeContext,
            onFieldsChange: (fields) => {
              persistViewFields(mapBoardFieldDefinitionsToViewFields(fields));
            },
          }}
        >
          <ViewBar
            optionsDropdownButton={<BoardOptionsDropdown />}
            optionsDropdownScopeId={BoardOptionsDropdownId}
          />
          <HooksCompanyBoardEffect />
          <RecordBoard
            boardOptions={opportunitiesBoardOptions}
            onColumnAdd={onColumnAdd}
            onColumnDelete={onColumnDelete}
            onEditColumnTitle={onEditColumnTitle}
          />
          <RecordBoardActionBar />
          <RecordBoardContextMenu />
        </BoardContext.Provider>
      </StyledContainer>
    </ViewScope>
  );
};
