import { createContext } from 'react';

export const RecordLevelPermissionVariablePickerContext = createContext<{
  recordFilterId: string;
  onSelect: (selection: {
    workspaceMemberFieldMetadataId: string;
    workspaceMemberSubFieldName?: string | null;
  }) => void;
} | null>(null);
