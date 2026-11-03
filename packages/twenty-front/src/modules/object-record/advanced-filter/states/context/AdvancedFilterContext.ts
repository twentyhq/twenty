import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldSelectLeadingSection } from '@/object-record/advanced-filter/types/FieldSelectLeadingSection';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { createContext } from 'react';

type AdvancedFilterContextType = {
  onUpdate?: () => void;
  isWorkflowFindRecords?: boolean;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  fieldSelectLeadingSections?: FieldSelectLeadingSection[];
  objectMetadataItem?: EnrichedObjectMetadataItem;
};

export const AdvancedFilterContext = createContext<AdvancedFilterContextType>(
  {} as AdvancedFilterContextType,
);
