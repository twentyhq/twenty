import { createContext } from 'react';

import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';

export const CoreRecordReferenceFieldsContext = createContext<
  CoreRecordReferenceField[]
>([]);
