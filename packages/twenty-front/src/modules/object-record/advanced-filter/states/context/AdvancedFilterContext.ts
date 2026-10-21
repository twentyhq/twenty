import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldSelectLeadingSectionsComponent } from '@/object-record/advanced-filter/types/FieldSelectLeadingSectionsComponent';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { createContext } from 'react';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';

type AdvancedFilterContextType = {
  onUpdate?: () => void;
  isWorkflowFindRecords?: boolean;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  FieldSelectLeadingSections?: FieldSelectLeadingSectionsComponent;
  availableContextKeys?: ConditionalDisplayContextKey[];
  objectMetadataItem?: EnrichedObjectMetadataItem;
};

export const AdvancedFilterContext = createContext<AdvancedFilterContextType>(
  {},
);
