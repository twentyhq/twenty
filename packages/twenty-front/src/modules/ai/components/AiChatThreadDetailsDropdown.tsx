import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconBell,
  IconHash,
  IconLink,
  IconListSearch,
  IconPencil,
  IconPlus,
  IconUsers,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AiChatThreadChannelPicker } from '@/ai/components/AiChatThreadChannelPicker';
import { AiChatThreadDetailsRow } from '@/ai/components/AiChatThreadDetailsRow';
import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { useAgentChatThreadMembers } from '@/ai/hooks/useAgentChatThreadMembers';
import { useAiChatThreadRecordTargets } from '@/ai/hooks/useAiChatThreadRecordTargets';
import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { useIsAiChatArtifactSurface } from '@/ai/hooks/useIsAiChatArtifactSurface';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { RecordChip } from '@/object-record/components/RecordChip';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { Dropdown as LegacyDropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledChannel = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

type AiChatThreadDetailsDropdownProps = {
  threadId: string;
};

export const AiChatThreadDetailsDropdown = ({
  threadId,
}: AiChatThreadDetailsDropdownProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const dropdownId = useWorkspaceSurfaceScopedComponentInstanceId(
    `ai-chat-thread-details-${threadId}`,
  );
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    threadId,
  );
  const followers = useAgentChatThreadMembers(thread);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const assignee = currentWorkspaceMembers.find(
    (workspaceMember) => workspaceMember.id === thread?.assigneeId,
  );
  const channel = useAtomStateValue(agentChatChannelsState)?.find(
    ({ id }) => id === thread?.channelId,
  );
  const ChannelIcon = useAgentChatChannelIcon(channel?.icon);
  const { closeDropdown } = useCloseDropdown();
  const isAiChatArtifactSurface = useIsAiChatArtifactSurface();
  const { openRecordTarget } = useChatTargetNavigation();
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const recordPickerDropdownId = `${dropdownId}-record-picker`;
  const {
    isAvailable: areRecordTargetsAvailable,
    targetRecords,
    canEditRecordTargets,
    openRecordPicker,
    handleRecordPickerChange,
  } = useAiChatThreadRecordTargets({
    threadId,
    recordPickerInstanceId: recordPickerDropdownId,
  });
  const { openDropdown } = useOpenDropdown();
  const setMultipleRecordPickerSearchFilter = useSetAtomComponentState(
    multipleRecordPickerSearchFilterComponentState,
    recordPickerDropdownId,
  );
  const hasTargetRecords = targetRecords.length > 0;
  const editRecordTargetsLabel = hasTargetRecords
    ? t`Edit linked records`
    : t`Link to a record`;
  const EditRecordTargetsIcon = hasTargetRecords ? IconPencil : IconPlus;

  // The picker is a dropdown of its own, so it opens where the details were
  const editRecordTargets = () => {
    closeDropdown(dropdownId);
    openRecordPicker();
    openDropdown({
      dropdownComponentInstanceIdFromProps: recordPickerDropdownId,
    });
  };

  return (
    <>
      <DropdownRoot dropdownId={dropdownId} type="panel">
        <Dropdown.Trigger
          render={
            <LightIconButton
              aria-label={t`Chat details`}
              title={t`Chat details`}
              emphasis="subtle"
            >
              <IconListSearch />
            </LightIconButton>
          }
        />
        <DropdownContent
          ref={dropdownContentRef}
          // The details are read first, so focus stays off the first chip
          initialFocus={() => dropdownContentRef.current}
          align="start"
          width={GenericDropdownContentWidth.ExtraLarge}
          aria-label={t`Chat details`}
        >
          <StyledDetails>
            {areRecordTargetsAvailable && (
              <AiChatThreadDetailsRow
                Icon={IconLink}
                label={t`Linked to`}
                action={
                  canEditRecordTargets && (
                    <LightIconButton
                      aria-label={editRecordTargetsLabel}
                      title={editRecordTargetsLabel}
                      emphasis="subtle"
                      onClick={editRecordTargets}
                    >
                      <EditRecordTargetsIcon />
                    </LightIconButton>
                  )
                }
              >
                {hasTargetRecords ? (
                  targetRecords.map(({ record, objectNameSingular }) => (
                    <RecordChip
                      key={`${objectNameSingular}-${record.id}`}
                      objectNameSingular={objectNameSingular}
                      record={record}
                      // Linked records open like the records the chat mentions
                      onClick={
                        isAiChatArtifactSurface
                          ? () => {
                              closeDropdown(dropdownId);
                              openRecordTarget({
                                recordId: record.id,
                                objectNameSingular,
                              });
                            }
                          : undefined
                      }
                    />
                  ))
                ) : (
                  <StyledEmptyValue>{t`None`}</StyledEmptyValue>
                )}
              </AiChatThreadDetailsRow>
            )}
            <AiChatThreadDetailsRow
              Icon={IconHash}
              label={t`Channel`}
              action={
                isDefined(thread) && (
                  <AiChatThreadChannelPicker
                    thread={thread}
                    dropdownId={`${dropdownId}-channel-picker`}
                  />
                )
              }
            >
              {isDefined(channel) ? (
                <StyledChannel>
                  <ChannelIcon size={theme.icon.size.sm} />
                  {channel.name}
                </StyledChannel>
              ) : (
                <StyledEmptyValue>{t`None`}</StyledEmptyValue>
              )}
            </AiChatThreadDetailsRow>
            <AiChatThreadDetailsRow Icon={IconUsers} label={t`Assignee`}>
              {isDefined(assignee) ? (
                <RecordChip
                  objectNameSingular={CoreObjectNameSingular.WorkspaceMember}
                  record={{ ...assignee, __typename: 'WorkspaceMember' }}
                />
              ) : (
                <StyledEmptyValue>{t`None`}</StyledEmptyValue>
              )}
            </AiChatThreadDetailsRow>
            <AiChatThreadDetailsRow Icon={IconBell} label={t`Following`}>
              {followers.map((workspaceMember) => (
                <RecordChip
                  key={workspaceMember.id}
                  objectNameSingular={CoreObjectNameSingular.WorkspaceMember}
                  record={{ ...workspaceMember, __typename: 'WorkspaceMember' }}
                />
              ))}
            </AiChatThreadDetailsRow>
          </StyledDetails>
        </DropdownContent>
      </DropdownRoot>
      {canEditRecordTargets && (
        <LegacyDropdown
          dropdownId={recordPickerDropdownId}
          dropdownPlacement="bottom-start"
          disableClickForClickableComponent
          clickableComponent={<span />}
          onClose={() => setMultipleRecordPickerSearchFilter('')}
          dropdownComponents={
            <MultipleRecordPicker
              focusId={recordPickerDropdownId}
              componentInstanceId={recordPickerDropdownId}
              onChange={handleRecordPickerChange}
              onSubmit={() => closeDropdown(recordPickerDropdownId)}
              onClickOutside={() => closeDropdown(recordPickerDropdownId)}
              layoutDirection="search-bar-on-top"
            />
          }
        />
      )}
    </>
  );
};
