import { type PeopleDataLabsPersonData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-person-data.type';

export type PeopleDataLabsPersonEnrichResult =
  | { outcome: 'skipped' }
  | { outcome: 'notFound' }
  | { outcome: 'matched'; data: PeopleDataLabsPersonData }
  | { outcome: 'transientError'; httpStatus: number; message: string }
  | { outcome: 'permanentError'; httpStatus: number; message: string };
