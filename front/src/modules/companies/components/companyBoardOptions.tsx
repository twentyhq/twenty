import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { NewCompanyProgressButton } from '@/companies/components/NewCompanyProgressButton';
import { BoardOptions } from '@/pipeline/types/BoardOptions';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';

export const companyBoardOptions: BoardOptions = {
  newCardComponent: (
    <RecoilScope>
      <NewCompanyProgressButton />
    </RecoilScope>
  ),
  cardComponent: <CompanyBoardCard />,
};
