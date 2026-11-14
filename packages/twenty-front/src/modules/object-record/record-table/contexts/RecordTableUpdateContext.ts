import { createContext } from 'react';

import { type RecordUpdateHookParams } from '@/object-record/record-field/ui/contexts/FieldContext';

// Lookup cells pass the related object to update a record other than the row
export const RecordTableUpdateContext = createContext<
  | ((params: RecordUpdateHookParams, objectNameSingular?: string) => void)
  | undefined
>(undefined);
