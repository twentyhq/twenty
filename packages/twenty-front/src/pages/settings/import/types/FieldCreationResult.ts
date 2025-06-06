export interface FieldCreationResult {
  success: boolean;
  fieldName: string;
  columnName: string;
  error?: string;
  field?: any;
}
