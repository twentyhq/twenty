import styled from '@emotion/styled';

import { mapBoardFieldDefinitionsToViewFields } from '@/companies/utils/mapBoardFieldDefinitionsToViewFields';
import {
  RecordBoard,
  RecordBoardProps,
} from '@/object-record/record-board/components/RecordBoard';
import { RecordBoardEffect } from '@/object-record/record-board/components/RecordBoardEffect';
import { RecordBoardOptionsDropdown } from '@/object-record/record-board/options/components/RecordBoardOptionsDropdown';
import { ViewBar } from '@/views/components/ViewBar';
import { useViewFields } from '@/views/hooks/internal/useViewFields';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

import { HooksCompanyBoardEffect } from '../../components/HooksCompanyBoardEffect';

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
  const viewBarId = 'company-board-view';
  const recordBoardId = 'company-board';

  const { persistViewFields } = useViewFields(viewBarId);

  return (
    <StyledContainer>
      <ViewBar
        viewBarId={viewBarId}
        optionsDropdownButton={
          <RecordBoardOptionsDropdown recordBoardId={recordBoardId} />
        }
        optionsDropdownScopeId={recordBoardId}
      />

      <HooksCompanyBoardEffect
        viewBarId={viewBarId}
        recordBoardId={recordBoardId}
      />
      <RecordBoardEffect
        recordBoardId={recordBoardId}
        onFieldsChange={(fields) => {
          persistViewFields(mapBoardFieldDefinitionsToViewFields(fields));
        }}
      />

      <RecordBoard
        recordBoardId={recordBoardId}
        boardOptions={opportunitiesBoardOptions}
        onColumnAdd={onColumnAdd}
        onColumnDelete={onColumnDelete}
        onEditColumnTitle={onEditColumnTitle}
      />
    </StyledContainer>
  );
};
