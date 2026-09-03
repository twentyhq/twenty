import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type InboxPlanContext } from '@/inbox/types/InboxPlanContext';
import { type InboxItem } from '~/generated/graphql';

// The context travels as JSON; only a summary makes it worth drawing.
export const getInboxPlanContext = (
  inboxItem: Pick<InboxItem, 'context'>,
): InboxPlanContext | null => {
  const context = inboxItem.context as Partial<InboxPlanContext> | null;

  if (!isDefined(context) || !isNonEmptyString(context.summary)) {
    return null;
  }

  return {
    summary: context.summary,
    source: context.source,
    entities: context.entities ?? [],
    edges: context.edges ?? [],
  };
};
