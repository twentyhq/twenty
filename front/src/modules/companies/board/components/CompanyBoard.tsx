import { pipelineAvailableFieldDefinitions } from '@/pipeline/constants/pipelineAvailableFieldDefinitions';
import {
  EntityBoard,
  type EntityBoardProps,
} from '@/ui/board/components/EntityBoard';
import { EntityBoardActionBar } from '@/ui/board/components/EntityBoardActionBar';
import { EntityBoardContextMenu } from '@/ui/board/components/EntityBoardContextMenu';
import { useBoardViews } from '@/views/hooks/useBoardViews';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

import { HooksCompanyBoardEffect } from '../../components/HooksCompanyBoardEffect';
import { CompanyBoardRecoilScopeContext } from '../../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

type CompanyBoardProps = Pick<
  EntityBoardProps,
  'onColumnAdd' | 'onColumnDelete' | 'onEditColumnTitle'
>;

export const CompanyBoard = ({ ...props }: CompanyBoardProps) => {
  const { handleViewsChange, handleViewSubmit } = useBoardViews({
    objectId: 'company',
    scopeContext: CompanyBoardRecoilScopeContext,
    fieldDefinitions: pipelineAvailableFieldDefinitions,
  });

  return (
    <>
      <HooksCompanyBoardEffect />
      <EntityBoard
        boardOptions={opportunitiesBoardOptions}
        defaultViewName="All opportunities"
        onViewsChange={handleViewsChange}
        onViewSubmit={handleViewSubmit}
        onColumnAdd={props.onColumnAdd}
        scopeContext={CompanyBoardRecoilScopeContext}
        onEditColumnTitle={props.onEditColumnTitle}
      />
      <EntityBoardActionBar />
      <EntityBoardContextMenu />
    </>
  );
};
