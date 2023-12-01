import { Company } from '@/companies/types/Company';
import { Opportunity } from '@/pipeline/types/Opportunity';

export type CompanyForBoard = Pick<Company, 'id' | 'name' | 'domainName'>;

export type CompanyProgress = {
  company: CompanyForBoard;
  opportunity: Opportunity;
};

export type CompanyProgressDict = {
  [key: string]: CompanyProgress;
};
