import {
  EntityBoard,
  type EntityBoardProps,
} from '@/ui/board/components/EntityBoard';
import { EntityBoardActionBar } from '@/ui/board/components/EntityBoardActionBar';
import { EntityBoardContextMenu } from '@/ui/board/components/EntityBoardContextMenu';
import { useBoardViews } from '@/views/hooks/useBoardViews';

import { HooksCompanyBoard } from '../../components/HooksCompanyBoard';
import { CompanyBoardRecoilScopeContext } from '../../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

type OwnProps = Pick<
  EntityBoardProps,
  'boardOptions' | 'onColumnAdd' | 'onColumnDelete' | 'onEditColumnTitle'
>;

export const CompanyBoard = ({ boardOptions, ...props }: OwnProps) => {
  useBoardViews({
    objectId: 'company',
    scopeContext: CompanyBoardRecoilScopeContext,
  });

  return (
    <>
      <HooksCompanyBoard />
      <EntityBoard
        boardOptions={boardOptions}
        defaultViewName="All opportunities"
        scopeContext={CompanyBoardRecoilScopeContext}
        {...props}
      />
      <EntityBoardActionBar />
      <EntityBoardContextMenu />
    </>
  );
};
