import { FaBullseye } from 'react-icons/fa';

import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { AppPage } from '~/AppPage';

import {
  initialBoard,
  items,
} from '../../modules/ui/components/board/__stories__/mock-data';
import { Board } from '../../modules/ui/components/board/Board';

export function Opportunities() {
  return (
    <AppPage>
      <WithTopBarContainer title="Opportunities" icon={<FaBullseye />}>
        <Board initialBoard={initialBoard} items={items} />
      </WithTopBarContainer>
    </AppPage>
  );
}
