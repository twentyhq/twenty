import { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { Column } from '@/ui/components/board/Board';
import { NewButton as UINewButton } from '@/ui/components/board/NewButton';
import {
  Company,
  PipelineProgressableType,
  useCreateOnePipelineProgressMutation,
} from '~/generated/graphql';

import { boardColumnsState } from '../states/boardColumnsState';
import { boardItemsState } from '../states/boardItemsState';

import { NewCompanyBoardCard } from './NewCompanyBoardCard';

type OwnProps = {
  pipelineId: string;
  columnId: string;
};

export function NewButton({ pipelineId, columnId }: OwnProps) {
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [board, setBoard] = useRecoilState(boardColumnsState);
  const [boardItems, setBoardItems] = useRecoilState(boardItemsState);

  const [createOnePipelineProgress] = useCreateOnePipelineProgressMutation();
  const onEntitySelect = useCallback(
    async (company: Pick<Company, 'id' | 'name' | 'domainName'>) => {
      setIsCreatingCard(false);
      const newUuid = uuidv4();
      const newBoard = JSON.parse(JSON.stringify(board));
      const destinationColumnIndex = newBoard.findIndex(
        (column: Column) => column.id === columnId,
      );
      newBoard[destinationColumnIndex].itemKeys.push(newUuid);
      setBoardItems({
        ...boardItems,
        [newUuid]: {
          id: company.id,
          name: company.name,
          domainName: company.domainName,
          createdAt: new Date().toISOString(),
        },
      });
      setBoard(newBoard);
      await createOnePipelineProgress({
        variables: {
          uuid: newUuid,
          pipelineStageId: columnId,
          pipelineId,
          entityId: company.id,
          entityType: PipelineProgressableType.Company,
        },
      });
    },
    [
      createOnePipelineProgress,
      columnId,
      pipelineId,
      board,
      setBoard,
      boardItems,
      setBoardItems,
    ],
  );

  const onNewClick = useCallback(() => {
    setIsCreatingCard(true);
  }, [setIsCreatingCard]);
  return (
    <>
      {isCreatingCard && (
        <RecoilScope>
          <NewCompanyBoardCard onEntitySelect={onEntitySelect} />
        </RecoilScope>
      )}
      <UINewButton onClick={onNewClick} />
    </>
  );
}
