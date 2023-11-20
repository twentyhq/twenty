import { useEffect } from 'react';
import styled from '@emotion/styled';

import { CompanyBoard } from '@/companies/board/components/CompanyBoard';
import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { PipelineAddButton } from '@/pipeline/components/PipelineAddButton';
import { usePipelineSteps } from '@/pipeline/hooks/usePipelineSteps';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { IconTargetArrow } from '@/ui/display/icon';
import { BoardOptionsContext } from '@/ui/layout/board/contexts/BoardOptionsContext';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useView } from '@/views/hooks/useView';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

const StyledBoardContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const Opportunities = () => {
  const { handlePipelineStepAdd, handlePipelineStepDelete } =
    usePipelineSteps();

  const { updateOneObject: updateOnePipelineStep } =
    useUpdateOneObjectRecord<PipelineStep>({
      objectNameSingular: 'pipelineStep',
    });

  const handleEditColumnTitle = (
    boardColumnId: string,
    newTitle: string,
    newColor: string,
  ) => {
    updateOnePipelineStep?.({
      idToUpdate: boardColumnId,
      input: {
        name: newTitle,
        color: newColor,
      },
    });
  };

  const opportunitiesV2MetadataId = useObjectMetadataItem({
    objectNameSingular: 'opportunity',
  }).objectMetadataItem?.id;

  const { setViewObjectMetadataId } = useView({
    viewScopeId: 'company-board-view',
  });

  useEffect(() => {
    setViewObjectMetadataId?.(opportunitiesV2MetadataId);
  }, [opportunitiesV2MetadataId, setViewObjectMetadataId]);

  return (
    <PageContainer>
      <RecoilScope>
        <PageHeader title="Opportunities" Icon={IconTargetArrow}>
          <PipelineAddButton />
        </PageHeader>
        <PageBody>
          <BoardOptionsContext.Provider value={opportunitiesBoardOptions}>
            <CompanyBoardRecoilScopeContext.Provider value="opportunities">
              <StyledBoardContainer>
                <CompanyBoard
                  onColumnAdd={handlePipelineStepAdd}
                  onColumnDelete={handlePipelineStepDelete}
                  onEditColumnTitle={handleEditColumnTitle}
                />
              </StyledBoardContainer>
            </CompanyBoardRecoilScopeContext.Provider>
          </BoardOptionsContext.Provider>
        </PageBody>
      </RecoilScope>
    </PageContainer>
  );
};
