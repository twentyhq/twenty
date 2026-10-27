import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DetailsRow } from 'twenty-ui/components/data-display';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconHash,
  IconLink,
  IconListSearch,
  IconPencil,
  IconPlus,
  IconUsers,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AgentChatChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { AiChatThreadChannelPicker } from '@/ai/components/AiChatThreadChannelPicker';
import { AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX } from '@/ai/constants/AiChatThreadDetailsLabelWidthInPx';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { useAiChatThreadRecordTargets } from '@/ai/hooks/useAiChatThreadRecordTargets';
import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { useIsAiChatArtifactSurface } from '@/ai/hooks/useIsAiChatArtifactSurface';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { useOpenAssignAiChatInSidePanel } from '@/side-panel/hooks/useOpenAssignAiChatInSidePanel';
import { RecordChip } from '@/object-record/components/RecordChip';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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

const StyledDetails = styled.dl`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin: 0;
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
  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    threadId,
  );
  const canChangeAssignee =
    (permissions?.canUpdate ?? false) && !isDefined(thread?.deletedAt);
  const { openAssignAiChatInSidePanel } = useOpenAssignAiChatInSidePanel();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const assignee = currentWorkspaceMembers.find(
    (workspaceMember) => workspaceMember.id === thread?.assigneeId,
  );
  const channel = useAtomStateValue(agentChatChannelsState)?.find(
    ({ id }) => id === thread?.channelId,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { closeDropdown } = useCloseDropdown();
  const isAiChatArtifactSurface = useIsAiChatArtifactSurface();
  const { openRecordTarget } = useChatTargetNavigation();
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const detailsTriggerRef = useRef<HTMLButtonElement>(null);
  const recordPickerContentRef = useRef<HTMLDivElement>(null);
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
  const hasTargetRecords = isNonEmptyArray(targetRecords);
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

  if (!isAiChatInboxEnabled) {
    return null;
  }

  return (
    <>
      <DropdownRoot dropdownId={dropdownId} type="panel">
        <Dropdown.Trigger
          render={
            <LightIconButton
              ref={detailsTriggerRef}
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
          width={GenericDropdownContentWidth.ExtraExtraLarge}
          aria-label={t`Chat details`}
        >
          <StyledDetails>
            {areRecordTargetsAvailable && (
              <DetailsRow
                labelWidth={AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
                startIcon={<IconLink size={themeCssVariables.icon.size.md} />}
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
              </DetailsRow>
            )}
            <DetailsRow
              labelWidth={AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
              startIcon={<IconHash size={themeCssVariables.icon.size.md} />}
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
                  <AgentChatChannelIcon
                    channel={channel}
                    size={theme.icon.size.sm}
                  />
                  {channel.name}
                </StyledChannel>
              ) : (
                <StyledEmptyValue>{t`None`}</StyledEmptyValue>
              )}
            </DetailsRow>
            <DetailsRow
              labelWidth={AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
              startIcon={<IconUsers size={themeCssVariables.icon.size.md} />}
              label={t`Assignee`}
              action={
                canChangeAssignee && (
                  <LightIconButton
                    aria-label={t`Change assignee`}
                    title={t`Change assignee`}
                    emphasis="subtle"
                    onClick={() => {
                      closeDropdown(dropdownId);
                      openAssignAiChatInSidePanel([threadId]);
                    }}
                  >
                    <IconPencil />
                  </LightIconButton>
                )
              }
            >
              {isDefined(assignee) ? (
                <RecordChip
                  objectNameSingular={CoreObjectNameSingular.WorkspaceMember}
                  record={{ ...assignee, __typename: 'WorkspaceMember' }}
                />
              ) : (
                <StyledEmptyValue>{t`None`}</StyledEmptyValue>
              )}
            </DetailsRow>
          </StyledDetails>
        </DropdownContent>
      </DropdownRoot>
      {canEditRecordTargets && (
        <DropdownRoot
          dropdownId={recordPickerDropdownId}
          type="picker"
          multiple
        >
          <DropdownContent
            ref={recordPickerContentRef}
            anchor={detailsTriggerRef}
            finalFocus={(interaction) => {
              const detailsTrigger = detailsTriggerRef.current;

              if (interaction !== 'keyboard' || !isDefined(detailsTrigger)) {
                return false;
              }

              const ownerDocument = detailsTrigger.ownerDocument;
              const activeElement = ownerDocument.activeElement;
              const isFocusStillInsidePicker =
                activeElement === ownerDocument.body ||
                (recordPickerContentRef.current?.contains(activeElement) ??
                  false);

              return isFocusStillInsidePicker ? detailsTrigger : false;
            }}
            side="bottom"
            align="start"
            aria-label={editRecordTargetsLabel}
          >
            <MultipleRecordPicker
              componentInstanceId={recordPickerDropdownId}
              onChange={handleRecordPickerChange}
              layoutDirection="search-bar-on-top"
            />
          </DropdownContent>
        </DropdownRoot>
      )}
    </>
  );
};
