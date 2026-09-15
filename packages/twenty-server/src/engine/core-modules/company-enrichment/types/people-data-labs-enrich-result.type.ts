export type PeopleDataLabsEnrichResult<TData> =
  | { outcome: 'skipped' }
  | { outcome: 'notFound' }
  | { outcome: 'matched'; data: TData }
  | { outcome: 'transientError'; httpStatus: number; message: string }
  | { outcome: 'permanentError'; httpStatus: number; message: string };
