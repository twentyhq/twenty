import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  InboxItemPlanContext,
  type InboxItemPlanContextValue,
} from '@/inbox/contexts/InboxItemPlanContext';

export const useInboxItemPlanContext = (): InboxItemPlanContextValue => {
  const context = useContext(InboxItemPlanContext);

  if (!isDefined(context)) {
    throw new Error(
      'useInboxItemPlanContext must be used within an InboxItemPlanProvider',
    );
  }

  return context;
};
