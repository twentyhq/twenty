import { type PeopleDataLabsCompanyData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-company-data.type';

export type PeopleDataLabsCompanyEnrichResult =
  | { outcome: 'skipped' }
  | { outcome: 'notFound' }
  | { outcome: 'matched'; data: PeopleDataLabsCompanyData }
  | { outcome: 'transientError'; httpStatus: number; message: string }
  | { outcome: 'permanentError'; httpStatus: number; message: string };
