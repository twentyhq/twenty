export type PeopleDataLabsResponseItemParseResult<TData> =
  | { outcome: 'matched'; httpStatus: number; likelihood?: number; data: TData }
  | { outcome: 'notFound'; httpStatus: number }
  | { outcome: 'error'; httpStatus: number; message: string };
