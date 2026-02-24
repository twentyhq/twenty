export type JsonLogicRule =
  | boolean
  | string
  | number
  | null
  | { [operator: string]: JsonLogicRule[] | JsonLogicRule }
  | JsonLogicRule[];
