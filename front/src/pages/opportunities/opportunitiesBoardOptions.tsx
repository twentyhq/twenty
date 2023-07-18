import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { NewCompanyProgressButton } from '@/companies/components/NewCompanyProgressButton';
import { BoardOptions } from '@/pipeline/types/BoardOptions';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';

import { opportunitiesFilters } from './opportunities-filters';
import { opportunitiesSorts } from './opportunities-sorts';

export const opportunitiesBoardOptions: BoardOptions = {
  newCardComponent: (
    <RecoilScope>
      <NewCompanyProgressButton />
    </RecoilScope>
  ),
  cardComponent: <CompanyBoardCard />,
  filters: opportunitiesFilters,
  sorts: opportunitiesSorts,
};
