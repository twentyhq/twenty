import { FaBullseye } from 'react-icons/fa';

import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';
import { AppPage } from '~/AppPage';

import {
  initialBoard,
  items,
} from '../../modules/opportunities/components/__stories__/mock-data';
import { Board } from '../../modules/opportunities/components/Board';

export function Opportunities() {
  return (
    <AppPage>
      <WithTopBarContainer title="Opportunities" icon={<FaBullseye />}>
        <Board initialBoard={initialBoard} items={items} />
      </WithTopBarContainer>
    </AppPage>
  );
}
