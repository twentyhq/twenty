export type ConflictingSubField = {
  fullPath: string;
  column: string;
};

export type ConflictingFieldGroup = {
  baseField: string;
  subFields: ConflictingSubField[];
};
