import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { NewCompanyProgressButton } from '@/companies/components/NewCompanyProgressButton';
import { BoardOptions } from '@/ui/layout/board/types/BoardOptions';

import { opportunityBoardFilterDefinitions } from './constants/opportunityBoardFilterDefinitions';
import { opportunityBoardSortDefinitions } from './constants/opportunityBoardSortDefinitions';

export const opportunitiesBoardOptions: BoardOptions = {
  newCardComponent: <NewCompanyProgressButton />,
  CardComponent: CompanyBoardCard,
  filterDefinitions: opportunityBoardFilterDefinitions,
  sortDefinitions: opportunityBoardSortDefinitions,
};
