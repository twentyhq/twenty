import { createContext } from 'react';

import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';

export const RecordFieldDisplayOverridesContext = createContext<
  RecordFieldDisplayOverride[]
>([]);
