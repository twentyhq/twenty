export type EntityFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'icon';

export type EntityFieldMetadata = {
  fieldName: string;
  label: string;
  type: EntityFieldType;
  icon: JSX.Element;
  columnSize: number;
  filterIcon?: JSX.Element;
};
