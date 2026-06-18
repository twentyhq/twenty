import { type IconComponent } from 'twenty-ui/icon';

export type SpreadsheetImportFieldOption = {
  Icon: IconComponent | null | undefined;
  value: string;
  label: string;
  shortLabelForNestedField?: string;
  disabled?: boolean;
  fieldMetadataTypeLabel?: string;
  isNestedField?: boolean;
  fieldMetadataItemId?: string;
};
