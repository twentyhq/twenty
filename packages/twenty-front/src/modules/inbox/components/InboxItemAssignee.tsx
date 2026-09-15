import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useInboxItemAssignee } from '@/inbox/hooks/useInboxItemAssignee';
import { type InboxItem } from '~/generated/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledAssignee = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledName = styled.div`
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type InboxItemAssigneeProps = {
  inboxItem: InboxItem;
  hasName?: boolean;
};

// Only shown on work that came from a shared inbox: in someone's own inbox
// every item is theirs, so the face would be on every row and say nothing.
export const InboxItemAssignee = ({
  inboxItem,
  hasName = false,
}: InboxItemAssigneeProps) => {
  const { t } = useLingui();
  const assignee = useInboxItemAssignee(inboxItem.assigneeUserWorkspaceId);

  if (
    !isDefined(inboxItem.queueId) ||
    !isDefined(inboxItem.assigneeUserWorkspaceId)
  ) {
    return null;
  }

  // A member the workspace no longer lists still holds the item, so it keeps
  // reading as taken rather than falling back to looking unclaimed.
  const fullName = isDefined(assignee)
    ? [assignee.name.firstName, assignee.name.lastName]
        .filter(isNonEmptyString)
        .join(' ')
    : t`a former member`;

  const label = inboxItem.isAssignedToMe ? t`you` : fullName;

  return (
    <StyledAssignee>
      <Avatar
        aria-label={t`Assigned to ${label}`}
        colorSeed={assignee?.id ?? inboxItem.assigneeUserWorkspaceId}
        name={assignee?.name.firstName ?? ''}
        nativeButton={false}
        shape="circle"
        size="sm"
        src={getAbsoluteImageUrl(assignee?.avatarUrl)}
      />
      {hasName && <StyledName>{t`Assigned to ${label}`}</StyledName>}
    </StyledAssignee>
  );
};
