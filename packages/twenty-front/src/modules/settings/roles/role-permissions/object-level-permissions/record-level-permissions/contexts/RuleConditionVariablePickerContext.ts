import { createContext } from 'react';

import { type RLSDynamicValue } from '@/object-record/record-filter/types/RecordFilter';

export const RuleConditionVariablePickerContext = createContext<{
  recordFilterId: string;
  onSelect: (selection: RLSDynamicValue) => void;
} | null>(null);
