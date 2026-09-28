import { type FieldMetadataType } from 'twenty-shared/types';

export type ValidationRuleEditorField = {
  path: string;
  label: string;
  parentLabel: string | null;
  iconName: string;
  type: FieldMetadataType;
  objectLabelSingular: string;
  objectIconName: string;
  selectOptionValues: string[];
  isSystem: boolean;
  hasMembers: boolean;
};
