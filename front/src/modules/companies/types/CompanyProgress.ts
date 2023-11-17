import { Opportunity } from '@/pipeline/types/Opportunity';
import { Company } from '~/generated/graphql';

export type CompanyForBoard = Pick<Company, 'id' | 'name' | 'domainName'>;
export type PipelineProgressForBoard = Opportunity;

export type CompanyProgress = {
  company: CompanyForBoard;
  pipelineProgress: PipelineProgressForBoard;
};

export type CompanyProgressDict = {
  [key: string]: CompanyProgress;
};
