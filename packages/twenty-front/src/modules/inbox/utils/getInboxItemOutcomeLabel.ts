import { t } from '@lingui/core/macro';

import { InboxItemOutcome } from '~/generated/graphql';

export const getInboxItemOutcomeLabel = (outcome: InboxItemOutcome): string => {
  switch (outcome) {
    case InboxItemOutcome.DONE:
      return t`Done`;
    case InboxItemOutcome.PARTIAL:
      return t`Partially done`;
    case InboxItemOutcome.DISMISSED:
      return t`Dismissed`;
  }
};
