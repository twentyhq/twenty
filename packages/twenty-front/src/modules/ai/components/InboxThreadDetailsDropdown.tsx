import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ComponentProps, useRef } from 'react';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';
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

import { InboxChannelIcon } from '@/ai/components/InboxChannelIcon';
import { InboxThreadChannelPicker } from '@/ai/components/InboxThreadChannelPicker';
import { InboxThreadDetailsFollowing } from '@/ai/components/InboxThreadDetailsFollowing';
import { InboxThreadDetailsStatus } from '@/ai/components/InboxThreadDetailsStatus';
import { InboxThreadLabelsField } from '@/ai/components/InboxThreadLabelsField';
import { INBOX_THREAD_DETAILS_LABEL_WIDTH_IN_PX } from '@/ai/constants/InboxThreadDetailsLabelWidthInPx';
import { inboxChannelsState } from '@/ai/states/inboxChannelsState';
import { useInboxThreadRecordTargets } from '@/ai/hooks/useInboxThreadRecordTargets';
import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { useIsInboxArtifactSurface } from '@/ai/hooks/useIsInboxArtifactSurface';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
import { inboxThreadPermissionsFamilySelector } from '@/ai/states/selectors/inboxThreadPermissionsFamilySelector';
import { useOpenAssignInboxInSidePanel } from '@/side-panel/hooks/useOpenAssignInboxInSidePanel';
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

type InboxThreadDetailsDropdownProps = {
  threadId: string;
  labels?: ComponentProps<typeof InboxThreadLabelsField>;
};

export const InboxThreadDetailsDropdown = ({
  threadId,
  labels,
}: InboxThreadDetailsDropdownProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const dropdownId = useWorkspaceSurfaceScopedComponentInstanceId(
    `ai-chat-thread-details-${threadId}`,
  );
  const thread = useAtomFamilySelectorValue(
    inboxThreadRecordFamilySelector,
    threadId,
  );
  const permissions = useAtomFamilySelectorValue(
    inboxThreadPermissionsFamilySelector,
    threadId,
  );
  const canChangeAssignee =
    (permissions?.canUpdate ?? false) && !isDefined(thread?.deletedAt);
  const { openAssignInboxInSidePanel } = useOpenAssignInboxInSidePanel();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const assignee = currentWorkspaceMembers.find(
    (workspaceMember) => workspaceMember.id === thread?.assigneeId,
  );
  const channel = useAtomStateValue(inboxChannelsState)?.find(
    ({ id }) => id === thread?.channelId,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { closeDropdown } = useCloseDropdown();
  const isInboxArtifactSurface = useIsInboxArtifactSurface();
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
  } = useInboxThreadRecordTargets({
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

  if (
    !isAiChatInboxEnabled ||
    thread?.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
  ) {
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
            <InboxThreadDetailsStatus
              threadId={threadId}
              dropdownId={dropdownId}
            />
            {areRecordTargetsAvailable && (
              <DetailsRow
                labelWidth={INBOX_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
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
                        isInboxArtifactSurface
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
              labelWidth={INBOX_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
              startIcon={<IconHash size={themeCssVariables.icon.size.md} />}
              label={t`Channel`}
              action={
                isDefined(thread) && (
                  <InboxThreadChannelPicker
                    thread={thread}
                    dropdownId={`${dropdownId}-channel-picker`}
                  />
                )
              }
            >
              {isDefined(channel) ? (
                <StyledChannel>
                  <InboxChannelIcon
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
              labelWidth={INBOX_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
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
                      openAssignInboxInSidePanel([threadId]);
                    }}
                  >
                    <IconPencil />
                  </LightIconButton>
                )
              }
            >
              {isDefined(assignee) ? (
                <RecordChip
                  objectNameSingular={
                    StandardObjectNameSingular.WorkspaceMember
                  }
                  record={{ ...assignee, __typename: 'WorkspaceMember' }}
                />
              ) : (
                <StyledEmptyValue>{t`None`}</StyledEmptyValue>
              )}
            </DetailsRow>
            {isDefined(labels) && (
              <InboxThreadLabelsField
                labels={labels.labels}
                selectedLabelIds={labels.selectedLabelIds}
                isSaving={labels.isSaving}
                onLabelsChange={labels.onLabelsChange}
              />
            )}
            <InboxThreadDetailsFollowing threadId={threadId} />
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
