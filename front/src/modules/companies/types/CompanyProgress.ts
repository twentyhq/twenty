import { Company, Person, PipelineProgress } from '~/generated/graphql';

export type CompanyForBoard = Pick<Company, 'id' | 'name' | 'domainName'>;
export type PipelineProgressForBoard = Pick<
  PipelineProgress,
  | 'id'
  | 'amount'
  | 'closeDate'
  | 'progressableId'
  | 'probability'
  | 'pointOfContactId'
> & {
  pointOfContact?: Pick<Person, 'id' | 'displayName'> | null;
};

export type CompanyProgress = {
  company: CompanyForBoard;
  pipelineProgress: PipelineProgressForBoard;
};

export type CompanyProgressDict = {
  [key: string]: CompanyProgress;
};
