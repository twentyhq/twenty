import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { NewCompanyBoardCard } from '@/companies/components/NewCompanyBoardCard';

import { BoardOptions } from '../types/BoardOptions';

export const companyBoardOptions: BoardOptions = {
  newCardComponent: <NewCompanyBoardCard />,
  cardComponent: <CompanyBoardCard />,
};
