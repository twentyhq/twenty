import { createContext, type MouseEvent } from 'react';

import { type TriggerEventType } from 'twenty-ui/utilities';
import { type FieldDefinition } from '../types/FieldDefinition';
import { type FieldMetadata } from '../types/FieldMetadata';

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
  fieldDefinition: FieldDefinition<FieldMetadata>;
  useUpdateRecord?: RecordUpdateHook;
  recordId: string;
  isLabelIdentifier: boolean;
  isLabelIdentifierCompact?: boolean;
  labelIdentifierLink?: string;
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
