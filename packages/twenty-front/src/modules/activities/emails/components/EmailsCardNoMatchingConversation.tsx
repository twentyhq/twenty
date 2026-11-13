import { timelineThreadChannelFilterFamilyState } from '@/activities/emails/states/timelineThreadChannelFilterFamilyState';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useLingui } from '@lingui/react/macro';
import { IconFilterOff } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

export const EmailsCardNoMatchingConversation = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const setTimelineThreadChannelFilter = useSetAtomFamilyState(
    timelineThreadChannelFilterFamilyState,
    targetRecord.id,
  );

  return (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Title>{t`No matching conversations`}</EmptyState.Title>
        <EmptyState.Description>
          {t`No conversation uses this channel.`}
        </EmptyState.Description>
      </EmptyState.Content>
      <EmptyState.Actions>
        <Button
          startIcon={<IconFilterOff />}
          onClick={() => setTimelineThreadChannelFilter(null)}
          variant="outline"
        >{t`Clear filter`}</Button>
      </EmptyState.Actions>
    </EmptyState.Root>
  );
};
