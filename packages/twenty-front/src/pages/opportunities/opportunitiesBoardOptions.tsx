import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { NewOpportunityButton } from '@/companies/components/NewOpportunityButton';
import { BoardOptions } from '@/object-record/record-board-deprecated/types/BoardOptions';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

export const opportunitiesBoardOptions: BoardOptions = {
  newCardComponent: (
    <RecoilScope>
      <NewOpportunityButton />
    </RecoilScope>
  ),
  CardComponent: CompanyBoardCard,
};
