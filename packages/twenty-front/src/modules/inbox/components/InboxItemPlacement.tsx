import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useIcons, IconInbox, IconUser } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useToast } from 'twenty-ui/primitives/feedback';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { useInboxQueues } from '@/inbox/hooks/useInboxQueues';
import { Select } from '@/ui/input/components/Select';
import { type InboxItem } from '~/generated/graphql';

const StyledPlacement = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const PERSONAL_QUEUE_VALUE = 'personal';
const UNASSIGNED_VALUE = 'unassigned';

type InboxItemPlacementProps = {
  inboxItem: InboxItem;
};

// Which inbox the work sits in and who is doing it are two independent
// columns, so they get two controls. One combined verb had to guess which one
// the person meant, and in a personal list it could not say whether an item
// was theirs or the team's.
export const InboxItemPlacement = ({ inboxItem }: InboxItemPlacementProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { inboxQueues } = useInboxQueues({ isPolling: false });
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { assignInboxItem, moveInboxItem } = useInboxItemActions();
  const { enqueueToast } = useToast();

  const reportFailure = () =>
    enqueueToast({ variant: 'error', children: t`That could not be applied` });

  const queueOptions: SelectOption<string>[] = [
    { value: PERSONAL_QUEUE_VALUE, label: t`No shared inbox`, Icon: IconUser },
    ...inboxQueues.map((inboxQueue) => ({
      value: inboxQueue.id,
      label: inboxQueue.label,
      Icon: getIcon(inboxQueue.icon),
    })),
  ];

  // Only a shared inbox can hold work nobody has taken: a personal item with
  // no assignee would belong to no one, which the database refuses.
  const assigneeOptions: SelectOption<string>[] = [
    ...(isDefined(inboxItem.queueId)
      ? [{ value: UNASSIGNED_VALUE, label: t`Unassigned`, Icon: IconInbox }]
      : []),
    ...currentWorkspaceMembers.map((workspaceMember) => ({
      value: workspaceMember.userWorkspaceId ?? workspaceMember.id,
      label: [workspaceMember.name.firstName, workspaceMember.name.lastName]
        .filter(isNonEmptyString)
        .join(' '),
    })),
  ];

  const moveToQueue = (value: string) =>
    void moveInboxItem({
      inboxItemId: inboxItem.id,
      toQueueId: value === PERSONAL_QUEUE_VALUE ? null : value,
      expectedVersion: inboxItem.version,
    }).catch(reportFailure);

  const assignToMember = (value: string) =>
    void assignInboxItem({
      inboxItemId: inboxItem.id,
      toUserWorkspaceId: value === UNASSIGNED_VALUE ? null : value,
      expectedVersion: inboxItem.version,
    }).catch(reportFailure);

  return (
    <StyledPlacement>
      <Select
        dropdownId={`inbox-item-queue-${inboxItem.id}`}
        onChange={moveToQueue}
        options={queueOptions}
        selectSizeVariant="small"
        value={inboxItem.queueId ?? PERSONAL_QUEUE_VALUE}
      />
      <Select
        dropdownId={`inbox-item-assignee-${inboxItem.id}`}
        onChange={assignToMember}
        options={assigneeOptions}
        selectSizeVariant="small"
        value={inboxItem.assigneeUserWorkspaceId ?? UNASSIGNED_VALUE}
        withSearchInput
      />
    </StyledPlacement>
  );
};
