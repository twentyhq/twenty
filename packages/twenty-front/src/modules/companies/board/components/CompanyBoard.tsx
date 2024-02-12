import { useCallback } from 'react';
import styled from '@emotion/styled';

import { mapBoardFieldDefinitionsToViewFields } from '@/companies/utils/mapBoardFieldDefinitionsToViewFields';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import {
  RecordBoardDeprecated,
  RecordBoardDeprecatedProps,
} from '@/object-record/record-board-deprecated/components/RecordBoardDeprecated';
import { RecordBoardDeprecatedEffect } from '@/object-record/record-board-deprecated/components/RecordBoardDeprecatedEffect';
import { BoardOptionsDropdownId } from '@/object-record/record-board-deprecated/constants/BoardOptionsDropdownId';
import { RecordBoardDeprecatedOptionsDropdown } from '@/object-record/record-board-deprecated/options/components/RecordBoardDeprecatedOptionsDropdown';
import { BoardColumnDefinition } from '@/object-record/record-board-deprecated/types/BoardColumnDefinition';
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
  RecordBoardDeprecatedProps,
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

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: 'pipelineStep',
  });

  const onStageAdd = useCallback(
    (stage: BoardColumnDefinition) => {
      createOneRecord({
        name: stage.title,
        color: stage.colorCode,
        position: stage.position,
        id: stage.id,
      });
    },
    [createOneRecord],
  );

  return (
    <StyledContainer>
      <ViewBar
        viewBarId={viewBarId}
        optionsDropdownButton={
          <RecordBoardDeprecatedOptionsDropdown
            recordBoardId={recordBoardId}
            onStageAdd={onStageAdd}
          />
        }
        optionsDropdownScopeId={BoardOptionsDropdownId}
      />

      <HooksCompanyBoardEffect
        viewBarId={viewBarId}
        recordBoardId={recordBoardId}
      />
      <RecordBoardDeprecatedEffect
        recordBoardId={recordBoardId}
        onFieldsChange={(fields) => {
          persistViewFields(mapBoardFieldDefinitionsToViewFields(fields));
        }}
      />

      <RecordBoardDeprecated
        recordBoardId={recordBoardId}
        boardOptions={opportunitiesBoardOptions}
        onColumnAdd={onColumnAdd}
        onColumnDelete={onColumnDelete}
        onEditColumnTitle={onEditColumnTitle}
      />
    </StyledContainer>
  );
};
