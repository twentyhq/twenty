export type ConflictingProperty = {
  fullPath: string;
  column: string;
};

export type ConflictingFieldGroup = {
  baseField: string;
  conflictingProperties: ConflictingProperty[];
};
