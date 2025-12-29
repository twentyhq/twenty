import { createContext, type MouseEvent } from 'react';

import { type TriggerEventType } from 'twenty-ui/utilities';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

export type RecordUpdateHookParams = {
  variables: {
    where: Record<string, unknown>;
    updateOneRecordInput: Record<string, unknown>;
  };
};

export type RecordUpdateHookReturn = {
  loading?: boolean;
};

export type RecordUpdateHook = () => [
  (params: RecordUpdateHookParams) => void,
  RecordUpdateHookReturn,
];

export type GenericFieldContextType = {
  fieldMetadataItemId?: string;
  recordId: string;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  useUpdateRecord?: RecordUpdateHook;
  isLabelIdentifier: boolean;
  isLabelIdentifierCompact?: boolean;
  clearable?: boolean;
  maxWidth?: number;
  isCentered?: boolean;
  overridenIsFieldEmpty?: boolean;
  displayedMaxRows?: number;
  isDisplayModeFixHeight?: boolean;
  isRecordFieldReadOnly: boolean;
  disableChipClick?: boolean;
  onRecordChipClick?: (event: MouseEvent) => void;
  onOpenEditMode?: () => void;
  onCloseEditMode?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  triggerEvent?: TriggerEventType;
  isForbidden?: boolean;
  anchorId?: string;
};

export const FieldContext = createContext<GenericFieldContextType>(
  {} as GenericFieldContextType,
);
