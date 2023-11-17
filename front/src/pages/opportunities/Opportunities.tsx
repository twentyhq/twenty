import { useEffect } from 'react';
import styled from '@emotion/styled';

import { CompanyBoard } from '@/companies/board/components/CompanyBoard';
import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { PipelineAddButton } from '@/pipeline/components/PipelineAddButton';
import { usePipelineStages } from '@/pipeline/hooks/usePipelineStages';
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
  const { handlePipelineStageAdd, handlePipelineStageDelete } =
    usePipelineStages();

  const { updateOneObject: updateOnePipelineStep } =
    useUpdateOneObjectRecord<PipelineStep>({
      objectNameSingular: 'pipelineStepV2',
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

  const opportunitiesV2MetadataId = useFindOneObjectMetadataItem({
    objectNameSingular: 'opportunityV2',
  }).foundObjectMetadataItem?.id;

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
                  onColumnAdd={handlePipelineStageAdd}
                  onColumnDelete={handlePipelineStageDelete}
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
