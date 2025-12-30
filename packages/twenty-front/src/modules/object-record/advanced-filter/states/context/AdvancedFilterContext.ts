import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { createContext } from 'react';

type AdvancedFilterContextType = {
  onUpdate?: () => void;
  isWorkflowFindRecords?: boolean;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  objectMetadataItem: ObjectMetadataItem;
};

export const AdvancedFilterContext = createContext<AdvancedFilterContextType>(
  {} as AdvancedFilterContextType,
);
