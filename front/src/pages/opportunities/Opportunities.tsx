import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import { Board } from '../../modules/opportunities/components/Board';
import { useBoard } from '../../modules/opportunities/hooks/useBoard';

export function Opportunities() {
  const { initialBoard, items, loading, error } = useBoard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error...</div>;
  if (!initialBoard || !items)
    return <div>Initial board or items not found</div>;
  return (
    <WithTopBarContainer title="Opportunities" icon={<IconTargetArrow />}>
      <Board initialBoard={initialBoard} items={items} />
    </WithTopBarContainer>
  );
}
