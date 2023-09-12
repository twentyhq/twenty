import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { NewCompanyProgressButton } from '@/companies/components/NewCompanyProgressButton';
import { BoardOptions } from '@/ui/board/types/BoardOptions';

import { opportunitiesFilters } from './opportunities-filters';
import { opportunitiesSorts } from './opportunities-sorts';

export const opportunitiesBoardOptions: BoardOptions = {
  newCardComponent: <NewCompanyProgressButton />,
  CardComponent: CompanyBoardCard,
  filters: opportunitiesFilters,
  sorts: opportunitiesSorts,
};
