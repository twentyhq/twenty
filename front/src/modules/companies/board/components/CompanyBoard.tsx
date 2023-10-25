import { BoardContext } from '@/companies/states/contexts/BoardContext';
import {
  EntityBoard,
  EntityBoardProps,
} from '@/ui/layout/board/components/EntityBoard';
import { EntityBoardActionBar } from '@/ui/layout/board/components/EntityBoardActionBar';
import { EntityBoardContextMenu } from '@/ui/layout/board/components/EntityBoardContextMenu';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

import { HooksCompanyBoardEffect } from '../../components/HooksCompanyBoardEffect';
import { CompanyBoardRecoilScopeContext } from '../../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

type CompanyBoardProps = Pick<
  EntityBoardProps,
  'onColumnAdd' | 'onColumnDelete' | 'onEditColumnTitle'
>;

export const CompanyBoard = ({
  onColumnAdd,
  onColumnDelete,
  onEditColumnTitle,
}: CompanyBoardProps) => {
  return (
    <>
      <BoardContext.Provider
        value={{
          BoardRecoilScopeContext: CompanyBoardRecoilScopeContext,
        }}
      >
        <HooksCompanyBoardEffect />

        <EntityBoard
          boardOptions={opportunitiesBoardOptions}
          onColumnAdd={onColumnAdd}
          onColumnDelete={onColumnDelete}
          onEditColumnTitle={onEditColumnTitle}
        />
        <EntityBoardActionBar />
        <EntityBoardContextMenu />
      </BoardContext.Provider>
    </>
  );
};
