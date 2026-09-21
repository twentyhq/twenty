import { useCallback, useEffect, useRef, useState } from 'react';

import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { createPortal } from 'react-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Avatar, Tag } from 'twenty-ui/primitives/data-display';
import {
  IconDotsVertical,
  IconLink,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { LightIconButton } from 'twenty-ui/components';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import {
  type IssueWorklogRecord,
  useIssueWorklogs,
} from '@/task-manager/issue-detail/hooks/useIssueWorklogs';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const EMPTY_PARAGRAPH = [{ type: 'paragraph' as const, content: '' }];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['3']};
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledRow = styled.div<{ isFocused?: boolean }>`
  background-color: ${({ isFocused }) =>
    isFocused ? themeCssVariables.background.transparent.light : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  padding: ${themeCssVariables.spacing['1']};
  transition: background-color ${themeCssVariables.animation.duration.slow};
`;

const StyledTopRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing['2']};
  min-width: 0;
`;

const StyledAuthor = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDate = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['1']};
  margin-left: auto;
`;

// Indent matches the avatar's width (size="lg" = 24px) + the row's gap, so
// the description lines up under the author name instead of the avatar —
// same alignment rule as IssueCommentThread's comment body.
const StyledBody = styled.div`
  margin-left: calc(24px + ${themeCssVariables.spacing['2']});
`;

const StyledDescriptionEditor = styled.div`
  & .editor {
    min-height: 0;
  }
`;

const StyledComposer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledComposerEditor = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing['1']} ${themeCssVariables.spacing['2']};

  & .editor {
    min-height: 72px;
  }
`;

const StyledTimeInputWrapper = styled.div`
  width: 160px;
`;

const StyledComposerActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
`;

const formatTimeSpent = (minutes: number | null) => {
  if (!isDefined(minutes) || minutes <= 0) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return remainingMinutes === 0
    ? `${hours}h`
    : `${hours}h ${remainingMinutes}m`;
};

const getMemberName = (
  member: IssueWorklogRecord['member'],
  createdBy: IssueWorklogRecord['createdBy'],
  unknownLabel: string,
) => {
  if (member?.name) {
    return `${member.name.firstName ?? ''} ${member.name.lastName ?? ''}`.trim();
  }

  return createdBy?.name ?? unknownLabel;
};

// Without this, focusing the description editor never suppresses global
// single-letter hotkeys (e/c/m/...) — same fix IssueCommentThread already
// applies to its comment editor.
const useBlockEditorFocusHandlers = (focusId: string) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleBlockEditorFocus = useCallback(() => {
    pushFocusItemToFocusStack({
      component: {
        instanceId: focusId,
        type: FocusComponentType.ACTIVITY_RICH_TEXT_EDITOR,
      },
      focusId,
      globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  }, [focusId, pushFocusItemToFocusStack]);

  const handleBlockEditorBlur = useCallback(() => {
    removeFocusItemFromFocusStackById({ focusId });
  }, [focusId, removeFocusItemFromFocusStackById]);

  return { handleBlockEditorFocus, handleBlockEditorBlur };
};

// The description column stores plain markdown (no schema change), so
// rendering it read-only means parsing that markdown into blocks once the
// editor mounts, rather than passing blocknote JSON as initialContent.
const WorklogDescriptionView = ({
  description,
}: {
  description: string | null;
}) => {
  const editor = useCreateBlockNote({
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
  });

  useEffect(() => {
    if (!description) {
      return;
    }

    editor.replaceBlocks(
      editor.document,
      editor.tryParseMarkdownToBlocks(description),
    );
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledDescriptionEditor>
      <BlockEditor editor={editor} readonly />
    </StyledDescriptionEditor>
  );
};

type WorklogFormProps = {
  formId: string;
  issueId: string;
  initialTimeSpentMinutes?: string;
  initialDescription?: string | null;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (values: {
    timeSpentMinutes: number;
    description: string;
  }) => Promise<void>;
};

const WorklogForm = ({
  formId,
  issueId,
  initialTimeSpentMinutes = '',
  initialDescription,
  submitLabel,
  onCancel,
  onSubmit,
}: WorklogFormProps) => {
  const { t } = useLingui();
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(
    initialTimeSpentMinutes,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleBlockEditorFocus, handleBlockEditorBlur } =
    useBlockEditorFocusHandlers(formId);
  const { uploadAttachmentFile } = useUploadAttachmentFile();

  // Worklog has no attachment relation of its own (unlike issueComment), so
  // pasted/uploaded images are attached to the parent issue instead — same
  // place they'd land from the issue's own Files section.
  const handleUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await uploadAttachmentFile(file, {
      id: issueId,
      targetObjectNameSingular: 'issue',
    });

    return attachmentAbsoluteURL;
  };

  const editor = useCreateBlockNote({
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    placeholders: { default: t`Write what you worked on...` },
    uploadFile: handleUploadFile,
  });

  useEffect(() => {
    if (!initialDescription) {
      return;
    }

    editor.replaceBlocks(
      editor.document,
      editor.tryParseMarkdownToBlocks(initialDescription),
    );
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsedMinutes = Number(timeSpentMinutes);
  const isTimeValid =
    timeSpentMinutes.trim() !== '' &&
    Number.isFinite(parsedMinutes) &&
    parsedMinutes > 0;

  const handleSubmit = async () => {
    if (!isTimeValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        timeSpentMinutes: parsedMinutes,
        description: editor.blocksToMarkdownLossy(editor.document).trim(),
      });

      // Editing an existing entry unmounts this form right after (back to
      // display mode) — only the "log new time" composer needs a reset.
      if (!isDefined(onCancel)) {
        setTimeSpentMinutes('');
        editor.replaceBlocks(editor.document, EMPTY_PARAGRAPH);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledComposer>
      <StyledTimeInputWrapper>
        <TextInput
          type="number"
          label={t`Time spent (minutes)`}
          placeholder={t`e.g. 90`}
          value={timeSpentMinutes}
          onChange={setTimeSpentMinutes}
          fullWidth
        />
      </StyledTimeInputWrapper>
      <StyledComposerEditor>
        <BlockEditor
          editor={editor}
          onFocus={handleBlockEditorFocus}
          onBlur={handleBlockEditorBlur}
        />
      </StyledComposerEditor>
      <StyledComposerActions>
        {isDefined(onCancel) && (
          <Button
            title={t`Cancel`}
            onClick={onCancel}
            disabled={isSubmitting}
          />
        )}
        <Button
          title={submitLabel}
          onClick={handleSubmit}
          disabled={isSubmitting || !isTimeValid}
          accent="blue"
        />
      </StyledComposerActions>
    </StyledComposer>
  );
};

type WorklogRowProps = {
  worklog: IssueWorklogRecord;
  issueId: string;
  currentWorkspaceMemberId: string | undefined;
  isFocused?: boolean;
  onUpdate: (
    worklogId: string,
    updates: { timeSpentMinutes: number; description: string },
  ) => Promise<void>;
  onDelete: (worklogId: string) => Promise<void>;
};

const WorklogRow = ({
  worklog,
  issueId,
  currentWorkspaceMemberId,
  isFocused = false,
  onUpdate,
  onDelete,
}: WorklogRowProps) => {
  const { t } = useLingui();
  const [isEditing, setIsEditing] = useState(false);
  const { openModal } = useModal();
  const { closeDropdown } = useCloseDropdown();
  const { copyToClipboard } = useCopyToClipboard();
  const worklogRowRef = useRef<HTMLDivElement>(null);

  const dropdownId = `issue-worklog-menu-${worklog.id}`;
  const deleteModalId = `issue-worklog-delete-modal-${worklog.id}`;

  const isLogger =
    isDefined(currentWorkspaceMemberId) &&
    isDefined(worklog.memberId) &&
    worklog.memberId === currentWorkspaceMemberId;

  const memberName = getMemberName(
    worklog.member,
    worklog.createdBy,
    t`Unknown`,
  );
  const timeSpentLabel = formatTimeSpent(worklog.timeSpentMinutes);

  useEffect(() => {
    if (isFocused) {
      worklogRowRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isFocused]);

  const handleEdit = () => {
    closeDropdown(dropdownId);
    setIsEditing(true);
  };

  const handleDeleteClick = () => {
    closeDropdown(dropdownId);
    openModal(deleteModalId);
  };

  const handleSaveEdit = async (values: {
    timeSpentMinutes: number;
    description: string;
  }) => {
    await onUpdate(worklog.id, values);
    setIsEditing(false);
  };

  const handleCopyWorklogLink = () => {
    copyToClipboard(
      `${window.location.origin}${getAppPath(
        AppPath.TaskManagerIssuePage,
        { issueId },
        { worklogId: worklog.id },
      )}`,
      t`Link copied to clipboard`,
    );
  };

  if (isEditing) {
    return (
      <StyledRow>
        <WorklogForm
          formId={`worklog-edit-${worklog.id}`}
          issueId={issueId}
          initialTimeSpentMinutes={String(worklog.timeSpentMinutes ?? '')}
          initialDescription={worklog.description}
          submitLabel={t`Save`}
          onCancel={() => setIsEditing(false)}
          onSubmit={handleSaveEdit}
        />
      </StyledRow>
    );
  }

  return (
    <StyledRow ref={worklogRowRef} isFocused={isFocused}>
      <StyledTopRow>
        <Avatar
          placeholder={memberName}
          avatarUrl={getAbsoluteImageUrl(worklog.member?.avatarUrl)}
          type="rounded"
          size="lg"
        />
        <StyledHeader>
          <StyledAuthor>{memberName}</StyledAuthor>
          {isDefined(timeSpentLabel) && (
            <Tag text={timeSpentLabel} color="blue" />
          )}
          <StyledDate>
            {new Date(worklog.createdAt).toLocaleString()}
          </StyledDate>
          <StyledActions>
            <LightIconButton
              className="displayOnHover"
              Icon={IconLink}
              accent="tertiary"
              title={t`Copy link`}
              onClick={handleCopyWorklogLink}
            />
            {isLogger && (
              <Dropdown
                dropdownId={dropdownId}
                dropdownPlacement="bottom-end"
                clickableComponent={
                  <LightIconButton
                    className="displayOnHover"
                    Icon={IconDotsVertical}
                    accent="tertiary"
                  />
                }
                dropdownComponents={
                  <DropdownContent>
                    <DropdownMenuItemsContainer>
                      <MenuItem
                        LeftIcon={IconPencil}
                        text={t`Edit`}
                        onClick={handleEdit}
                      />
                      <MenuItem
                        LeftIcon={IconTrash}
                        text={t`Delete`}
                        accent="danger"
                        onClick={handleDeleteClick}
                      />
                    </DropdownMenuItemsContainer>
                  </DropdownContent>
                }
              />
            )}
          </StyledActions>
        </StyledHeader>
      </StyledTopRow>
      {isDefined(worklog.description) && worklog.description !== '' && (
        <StyledBody>
          <WorklogDescriptionView description={worklog.description} />
        </StyledBody>
      )}
      {createPortal(
        <ConfirmationModal
          modalInstanceId={deleteModalId}
          title={t`Delete Worklog`}
          subtitle={t`Are you sure you want to delete this logged time? This action cannot be undone.`}
          onConfirmClick={() => onDelete(worklog.id)}
          confirmButtonText={t`Delete Worklog`}
        />,
        document.body,
      )}
    </StyledRow>
  );
};

type IssueWorklogListProps = {
  issueId: string;
  focusedWorklogId?: string;
};

export const IssueWorklogList = ({
  issueId,
  focusedWorklogId,
}: IssueWorklogListProps) => {
  const { t } = useLingui();
  const { worklogs, logWork, updateWorklog, deleteWorklog } =
    useIssueWorklogs(issueId);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  return (
    <StyledContainer>
      <StyledList>
        {worklogs.length === 0 && (
          <StyledEmptyState>{t`No time logged yet.`}</StyledEmptyState>
        )}
        {worklogs.map((worklog) => (
          <WorklogRow
            key={worklog.id}
            worklog={worklog}
            issueId={issueId}
            isFocused={worklog.id === focusedWorklogId}
            currentWorkspaceMemberId={currentWorkspaceMember?.id}
            onUpdate={updateWorklog}
            onDelete={deleteWorklog}
          />
        ))}
      </StyledList>
      <WorklogForm
        formId={`worklog-new-${issueId}`}
        issueId={issueId}
        submitLabel={t`Log time`}
        onSubmit={(values) =>
          logWork({ ...values, memberId: currentWorkspaceMember?.id })
        }
      />
    </StyledContainer>
  );
};
