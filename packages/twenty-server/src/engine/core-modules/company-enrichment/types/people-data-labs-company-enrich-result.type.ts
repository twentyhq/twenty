import { type PeopleDataLabsCompanyData } from 'twenty-shared/people-data-labs';

export type PeopleDataLabsCompanyEnrichResult =
  | { outcome: 'skipped' }
  | { outcome: 'notFound' }
  | { outcome: 'matched'; data: PeopleDataLabsCompanyData }
  | { outcome: 'transientError'; httpStatus: number; message: string }
  | { outcome: 'permanentError'; httpStatus: number; message: string };
