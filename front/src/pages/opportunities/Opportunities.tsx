import { IconTarget } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { AppPage } from '~/AppPage';

import { Board } from '../../modules/opportunities/components/Board';
import { useBoard } from '../../modules/opportunities/hooks/useBoard';

export function Opportunities() {
  const { initialBoard, items, loading, error } = useBoard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error...</div>;
  if (!initialBoard || !items)
    return <div>Initial board or items not found</div>;
  return (
    <AppPage>
      <WithTopBarContainer title="Opportunities" icon={<IconTarget />}>
        <Board initialBoard={initialBoard} items={items} />
      </WithTopBarContainer>
    </AppPage>
  );
}
