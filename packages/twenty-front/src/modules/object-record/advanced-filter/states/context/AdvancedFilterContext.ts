import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldSelectLeadingSectionsComponent } from '@/object-record/advanced-filter/types/FieldSelectLeadingSectionsComponent';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { createContext } from 'react';

type AdvancedFilterContextType = {
  onUpdate?: () => void;
  isWorkflowFindRecords?: boolean;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  FieldSelectLeadingSections?: FieldSelectLeadingSectionsComponent;
  objectMetadataItem?: EnrichedObjectMetadataItem;
};

export const AdvancedFilterContext = createContext<AdvancedFilterContextType>(
  {},
);
