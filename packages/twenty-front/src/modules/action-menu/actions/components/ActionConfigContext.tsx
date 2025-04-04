import { RecordAgnosticConfigAction } from '@/action-menu/actions/types/RecordAgnosticConfigAction';
import { RecordConfigAction } from '@/action-menu/actions/types/RecordConfigAction';
import { createContext } from 'react';

export const ActionConfigContext = createContext<
  RecordConfigAction | RecordAgnosticConfigAction | null
>(null);
