import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { NewCompanyProgressButton } from '@/companies/components/NewCompanyProgressButton';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';

import { BoardOptions } from '../../pipeline-progress/types/BoardOptions';

export const companyBoardOptions: BoardOptions = {
  newCardComponent: (
    <RecoilScope>
      <NewCompanyProgressButton />
    </RecoilScope>
  ),
  cardComponent: <CompanyBoardCard />,
};
