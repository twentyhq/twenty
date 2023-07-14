import { CompanyBoardCard } from '@/companies/components/CompanyBoardCard';
import { NewCompanyProgressButton } from '@/companies/components/NewCompanyProgressButton';

import { BoardOptions } from '../../pipeline-progress/types/BoardOptions';

export const companyBoardOptions: BoardOptions = {
  newCardComponent: <NewCompanyProgressButton />,
  cardComponent: <CompanyBoardCard />,
};
