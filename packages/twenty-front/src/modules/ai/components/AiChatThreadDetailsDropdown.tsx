import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  Dropdown,
  LightIconButton,
  useDropdownPage,
} from 'twenty-ui/components';
import {
  IconBell,
  IconLink,
  IconListSearch,
  IconPencil,
  IconPlus,
  type IconComponent,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AgentChatThreadPreviewsEffect } from '@/ai/components/AgentChatThreadPreviewsEffect';
import { AiChatThreadLinkedRecordsPage } from '@/ai/components/AiChatThreadLinkedRecordsPage';
import { useAiChatArtifactSurface } from '@/ai/hooks/useAiChatArtifactSurface';
import { useAiChatThreadLinkedRecords } from '@/ai/hooks/useAiChatThreadLinkedRecords';
import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { agentChatThreadPreviewFamilySelector } from '@/ai/states/selectors/agentChatThreadPreviewFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getAgentChatThreadMembers } from '@/ai/utils/getAgentChatThreadMembers';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { RecordChip } from '@/object-record/components/RecordChip';
import { type FieldWidgetRelationRecord } from '@/page-layout/widgets/field/types/FieldWidgetRelationRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const AI_CHAT_THREAD_DETAILS_PAGE = {
  DETAILS: 'details',
  LINKED_RECORDS: 'linked-records',
} as const;

const StyledDetails = styled.div`
  column-gap: ${themeCssVariables.spacing[3]};
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  padding: ${themeCssVariables.spacing[2]};
  row-gap: ${themeCssVariables.spacing[2]};
`;

const StyledLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-height: 24px;
`;

const StyledValue = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 24px;
  min-width: 0;
`;

type AiChatThreadDetailsRowProps = {
  Icon: IconComponent;
  label: string;
  children: ReactNode;
};

const AiChatThreadDetailsRow = ({
  Icon,
  label,
  children,
}: AiChatThreadDetailsRowProps) => {
  const theme = useTheme();

  return (
    <>
      <StyledLabel>
        <Icon size={theme.icon.size.sm} />
        {label}
      </StyledLabel>
      <StyledValue>{children}</StyledValue>
    </>
  );
};

type AiChatThreadLinkedRecordsValueProps = {
  dropdownId: string;
  linkedRecords: FieldWidgetRelationRecord[];
  canEditLinkedRecords: boolean;
};

const AiChatThreadLinkedRecordsValue = ({
  dropdownId,
  linkedRecords,
  canEditLinkedRecords,
}: AiChatThreadLinkedRecordsValueProps) => {
  const { t } = useLingui();
  const { goToPage } = useDropdownPage();
  const { closeDropdown } = useCloseDropdown();
  const { isAiChatArtifactSurface } = useAiChatArtifactSurface();
  const { openRecordTarget } = useChatTargetNavigation();
  const hasLinkedRecords = linkedRecords.length > 0;
  const editLabel = hasLinkedRecords
    ? t`Edit linked records`
    : t`Link to a record`;
  const EditIcon = hasLinkedRecords ? IconPencil : IconPlus;

  return (
    <>
      {linkedRecords.map(({ record, objectNameSingular }) => (
        <RecordChip
          key={`${objectNameSingular}-${record.id}`}
          objectNameSingular={objectNameSingular}
          record={record}
          // Linked records open like the records the chat mentions
          onClick={
            isAiChatArtifactSurface
              ? () => {
                  closeDropdown(dropdownId);
                  openRecordTarget({ recordId: record.id, objectNameSingular });
                }
              : undefined
          }
        />
      ))}
      {canEditLinkedRecords && (
        <LightIconButton
          aria-label={editLabel}
          title={editLabel}
          emphasis="subtle"
          onClick={() => goToPage(AI_CHAT_THREAD_DETAILS_PAGE.LINKED_RECORDS)}
        >
          <EditIcon />
        </LightIconButton>
      )}
    </>
  );
};

type AiChatThreadDetailsDropdownProps = {
  threadId: string;
};

export const AiChatThreadDetailsDropdown = ({
  threadId,
}: AiChatThreadDetailsDropdownProps) => {
  const { t } = useLingui();
  const dropdownId = useWorkspaceSurfaceScopedComponentInstanceId(
    `ai-chat-thread-details-${threadId}`,
  );
  const {
    isAvailable: areLinkedRecordsAvailable,
    linkedRecords,
    linkableObjectMetadataItems,
    canEditLinkedRecords,
    linkRecord,
    unlinkRecord,
  } = useAiChatThreadLinkedRecords({ threadId, instanceId: dropdownId });
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    threadId,
  );
  const preview = useAtomFamilySelectorValue(
    agentChatThreadPreviewFamilySelector,
    threadId,
  );
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const followers = getAgentChatThreadMembers({
    ownerWorkspaceMemberId: thread?.workspaceMemberId,
    memberIds: preview?.memberIds ?? [],
    workspaceMembers: currentWorkspaceMembers,
  });
  const previewThreads = useMemo(
    () =>
      isDefined(thread)
        ? [{ id: threadId, lastActivityAt: thread.lastActivityAt }]
        : [],
    [thread, threadId],
  );

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="panel"
      defaultPage={AI_CHAT_THREAD_DETAILS_PAGE.DETAILS}
      multiple
    >
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
        align="start"
        width={GenericDropdownContentWidth.ExtraLarge}
        aria-label={t`Chat details`}
      >
        <AgentChatThreadPreviewsEffect threads={previewThreads} />
        <Dropdown.Page id={AI_CHAT_THREAD_DETAILS_PAGE.DETAILS} type="panel">
          <StyledDetails>
            {areLinkedRecordsAvailable && (
              <AiChatThreadDetailsRow Icon={IconLink} label={t`Linked to`}>
                <AiChatThreadLinkedRecordsValue
                  dropdownId={dropdownId}
                  linkedRecords={linkedRecords}
                  canEditLinkedRecords={canEditLinkedRecords}
                />
              </AiChatThreadDetailsRow>
            )}
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
        </Dropdown.Page>
        <Dropdown.Page
          id={AI_CHAT_THREAD_DETAILS_PAGE.LINKED_RECORDS}
          type="picker"
        >
          <AiChatThreadLinkedRecordsPage
            linkedRecords={linkedRecords}
            linkableObjectMetadataItems={linkableObjectMetadataItems}
            onLink={(target) => void linkRecord(target)}
            onUnlink={(target) => void unlinkRecord(target)}
          />
        </Dropdown.Page>
      </DropdownContent>
    </DropdownRoot>
  );
};
