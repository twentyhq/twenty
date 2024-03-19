export type FieldValue =
  | string
  | boolean
  | number
  | FieldValue[]
  | { [key: string]: FieldValue };
