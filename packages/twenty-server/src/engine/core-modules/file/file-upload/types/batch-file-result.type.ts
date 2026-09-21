export type BatchFileResult<TValue> =
  | { success: true; value: TValue }
  | { success: false; error: string };
