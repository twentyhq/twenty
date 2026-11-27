import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { MetricRow } from 'twenty-ui/components/data-display';
import {
  OverflowingList,
  type OverflowingListProps,
} from 'twenty-ui/components/layout';
import { IconHash, IconLink, IconUserCircle, IconUsers } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AiChatChannelIcon } from '@/ai-chat/threads/components/AiChatChannelIcon';
import { useAiChatTargetNavigation } from '@/ai-chat/threads/hooks/useAiChatTargetNavigation';
import { useAiChatThreadMembers } from '@/ai-chat/threads/hooks/useAiChatThreadMembers';
import { useAiChatThreadRecordTargets } from '@/ai-chat/threads/hooks/useAiChatThreadRecordTargets';
import { aiChatChannelFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatChannelFamilySelector';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { AiChatContextCardSection } from '@/ai-chat/usage/components/AiChatContextCardSection';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

const StyledValue = styled.div`
  display: flex;
  max-width: calc(100cqw - 120px);
  min-width: 0;
`;

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

type OverflowingFieldName = 'participants' | 'linkedRecords';

type OverflowingListOpenChangeHandler = NonNullable<
  OverflowingListProps['onOpenChange']
>;

type AiChatContextChatDetailsFieldsProps = {
  thread: AiChatThreadRecord;
  onOverflowOpenChange: OverflowingListOpenChangeHandler;
  onRecordOpen: () => void;
};

export const AiChatContextChatDetailsFields = ({
  thread,
  onOverflowOpenChange,
  onRecordOpen,
}: AiChatContextChatDetailsFieldsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const [openOverflowFieldName, setOpenOverflowFieldName] =
    useState<OverflowingFieldName | null>(null);
  const participants = useAiChatThreadMembers(thread);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const assignee = currentWorkspaceMembers.find(
    ({ id }) => id === thread.assigneeId,
  );
  const channel = useAtomFamilySelectorValue(
    aiChatChannelFamilySelector,
    thread.channelId,
  );
  const { isAvailable: areRecordTargetsAvailable, targetRecords } =
    useAiChatThreadRecordTargets({
      threadId: thread.id,
      instanceId: `ai-chat-context-card-${thread.id}`,
    });
  const { openRecordTarget } = useAiChatTargetNavigation();

  const handleOverflowOpenChange =
    (fieldName: OverflowingFieldName): OverflowingListOpenChangeHandler =>
    (nextOpen, eventDetails) => {
      setOpenOverflowFieldName(nextOpen ? fieldName : null);
      onOverflowOpenChange(nextOpen, eventDetails);
    };

  const renderMemberChip = (workspaceMember: PartialWorkspaceMember) => (
    <RecordChip
      key={workspaceMember.id}
      objectNameSingular={StandardObjectNameSingular.WorkspaceMember}
      record={{ ...workspaceMember, __typename: 'WorkspaceMember' }}
    />
  );

  const emptyValue = <StyledEmptyValue>{t`None`}</StyledEmptyValue>;

  return (
    <AiChatContextCardSection title={t`Chat details`}>
      <MetricRow
        startIcon={<IconUsers size={theme.icon.size.sm} />}
        value={
          <StyledValue>
            {isNonEmptyArray(participants) ? (
              <OverflowingList
                showOverflowCount
                overflowLabel={t`Show all participants`}
                open={openOverflowFieldName === 'participants'}
                onOpenChange={handleOverflowOpenChange('participants')}
              >
                {participants.map(renderMemberChip)}
              </OverflowingList>
            ) : (
              emptyValue
            )}
          </StyledValue>
        }
      >
        {t`Participants`}
      </MetricRow>
      <MetricRow
        startIcon={<IconHash size={theme.icon.size.sm} />}
        value={
          <StyledValue>
            {isDefined(channel) ? (
              <Chip
                variant="plain"
                startElement={
                  <AiChatChannelIcon
                    channel={channel}
                    size={theme.icon.size.sm}
                  />
                }
              >
                {channel.name}
              </Chip>
            ) : (
              emptyValue
            )}
          </StyledValue>
        }
      >
        {t`Channel`}
      </MetricRow>
      <MetricRow
        startIcon={<IconUserCircle size={theme.icon.size.sm} />}
        value={
          <StyledValue>
            {isDefined(assignee) ? renderMemberChip(assignee) : emptyValue}
          </StyledValue>
        }
      >
        {t`Assignee`}
      </MetricRow>
      {areRecordTargetsAvailable && (
        <MetricRow
          startIcon={<IconLink size={theme.icon.size.sm} />}
          value={
            <StyledValue>
              {isNonEmptyArray(targetRecords) ? (
                <OverflowingList
                  showOverflowCount
                  overflowLabel={t`Show all linked records`}
                  open={openOverflowFieldName === 'linkedRecords'}
                  onOpenChange={handleOverflowOpenChange('linkedRecords')}
                >
                  {targetRecords.map(({ record, objectNameSingular }) => (
                    <RecordChip
                      key={`${objectNameSingular}-${record.id}`}
                      objectNameSingular={objectNameSingular}
                      record={record}
                      onClick={() => {
                        onRecordOpen();
                        openRecordTarget({
                          recordId: record.id,
                          objectNameSingular,
                        });
                      }}
                    />
                  ))}
                </OverflowingList>
              ) : (
                emptyValue
              )}
            </StyledValue>
          }
        >
          {t`Linked records`}
        </MetricRow>
      )}
    </AiChatContextCardSection>
  );
};
