export type ConflictingFieldValue = string | number | boolean;

export type ConflictingProperty = {
  fullPath: string;
  column: string;
};

export type ConflictingFieldGroup = {
  baseFields: string[];
  conflictingProperties: ConflictingProperty[];
};
