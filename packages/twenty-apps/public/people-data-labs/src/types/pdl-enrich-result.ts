export type PdlEnrichResult<TData> =
  | { outcome: 'matched'; httpStatus: number; likelihood?: number; data: TData }
  | { outcome: 'not_found'; httpStatus: number }
  | { outcome: 'error'; httpStatus: number; message: string };
