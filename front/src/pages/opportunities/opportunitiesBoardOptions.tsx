import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { NewOpportunityButton } from '@/companies/components/NewOpportunityButton';
import { BoardOptions } from '@/ui/object/record-board/types/BoardOptions';

export const opportunitiesBoardOptions: BoardOptions = {
  newCardComponent: <NewOpportunityButton />,
  CardComponent: CompanyBoardCard,
};
