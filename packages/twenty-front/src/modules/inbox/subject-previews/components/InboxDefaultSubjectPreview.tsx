import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemSubjectChip } from '@/inbox/components/InboxItemSubjectChip';
import { InboxPlanEntityGraph } from '@/inbox/components/InboxPlanEntityGraph';
import { type InboxItem } from '~/generated/graphql';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

type InboxDefaultSubjectPreviewProps = {
  inboxItem: InboxItem;
};

// What an item is about when its object has no preview of its own: one chip
// for the thing itself and the chain of records around it.
export const InboxDefaultSubjectPreview = ({
  inboxItem,
}: InboxDefaultSubjectPreviewProps) => (
  <StyledContent>
    <InboxItemSubjectChip
      inboxItem={inboxItem}
      source={inboxItem.context.source ?? undefined}
    />
    <InboxPlanEntityGraph records={inboxItem.records} />
  </StyledContent>
);
