import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { styled } from '@linaria/react';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  IconKey,
  IconPencil,
  IconTrash,
  IconUserCog,
  IconUserPlus,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SHAHRYAR_COLORS } from '@/shahryar/constants/shahryar-colors';
import {
  createShahryarSupervisor,
  fetchShahryarAdminWorkspaceMembers,
  removeShahryarSupervisor,
  resetShahryarWorkspaceMemberPassword,
  updateShahryarWorkspaceMemberUsername,
} from '@/shahryar/services/shahryarReportApi';
import {
  type ShahryarAdminSupervisorOperationResponse,
  type ShahryarAdminWorkspaceMember,
} from '@/shahryar/types/shahryarAdminApi';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  height: 100%;
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledForm = styled.form`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  max-width: 640px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledField = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  text-align: left;
`;

const StyledSelect = styled.select`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledSection = styled.section`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  max-width: 640px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSectionTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: 0;
`;

const StyledMemberMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBadge = styled.span<{ tone: 'neutral' | 'success' }>`
  background: ${({ tone }) =>
    tone === 'success'
      ? themeCssVariables.color.green3
      : themeCssVariables.background.transparent.light};
  border: 1px solid
    ${({ tone }) =>
      tone === 'success'
        ? themeCssVariables.color.green7
        : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ tone }) =>
    tone === 'success'
      ? themeCssVariables.color.green11
      : themeCssVariables.font.color.secondary};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledStatusLine = styled.div<{ tone: 'error' | 'success' }>`
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid
    ${({ tone }) =>
      tone === 'error'
        ? themeCssVariables.color.red5
        : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ tone }) =>
    tone === 'error' ? SHAHRYAR_COLORS.red : SHAHRYAR_COLORS.navy};
  font-size: ${themeCssVariables.font.size.sm};
  max-width: 640px;
  padding: ${themeCssVariables.spacing[3]};
`;

export const ShahryarAdminPage = () => {
  const [workspaceMembers, setWorkspaceMembers] = useState<
    ShahryarAdminWorkspaceMember[]
  >([]);
  const [workspaceMemberId, setWorkspaceMemberId] = useState('');
  const [usernameDraft, setUsernameDraft] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [statusTone, setStatusTone] = useState<'error' | 'success'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupervisorSubmitting, setIsSupervisorSubmitting] = useState(false);
  const [isUsernameSubmitting, setIsUsernameSubmitting] = useState(false);
  const [isRemovingSupervisor, setIsRemovingSupervisor] = useState(false);
  const [isLoadingWorkspaceMembers, setIsLoadingWorkspaceMembers] =
    useState(false);
  const [workspaceMembersErrorMessage, setWorkspaceMembersErrorMessage] =
    useState<string | undefined>();
  const selectedWorkspaceMember = workspaceMembers.find(
    (workspaceMember) => workspaceMember.id === workspaceMemberId,
  );
  const canSubmitSupervisorAction = workspaceMemberId.trim().length > 0;
  const canSubmitUsername = useMemo(
    () =>
      workspaceMemberId.trim().length > 0 && usernameDraft.trim().length > 0,
    [usernameDraft, workspaceMemberId],
  );
  const canSubmit = useMemo(
    () =>
      workspaceMemberId.trim().length > 0 &&
      newPassword.length >= 8 &&
      newPassword === confirmPassword,
    [confirmPassword, newPassword, workspaceMemberId],
  );
  const refreshWorkspaceMembers = useCallback(
    async ({ signal }: { signal?: AbortSignal } = {}) => {
      setIsLoadingWorkspaceMembers(true);
      setWorkspaceMembersErrorMessage(undefined);

      try {
        const members = await fetchShahryarAdminWorkspaceMembers({ signal });

        setWorkspaceMembers(members);
        setWorkspaceMemberId((currentWorkspaceMemberId) => {
          if (
            currentWorkspaceMemberId.length > 0 &&
            members.some((member) => member.id === currentWorkspaceMemberId)
          ) {
            return currentWorkspaceMemberId;
          }

          return members[0]?.id ?? '';
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setWorkspaceMembersErrorMessage('workspace-members-unavailable');
      } finally {
        setIsLoadingWorkspaceMembers(false);
      }
    },
    [],
  );

  useEffect(() => {
    const abortController = new AbortController();

    void refreshWorkspaceMembers({ signal: abortController.signal });

    return () => abortController.abort();
  }, [refreshWorkspaceMembers]);

  useEffect(() => {
    setUsernameDraft(selectedWorkspaceMember?.username ?? '');
  }, [selectedWorkspaceMember]);

  const applySupervisorOperationResponse = useCallback(
    (response: ShahryarAdminSupervisorOperationResponse) => {
      setWorkspaceMembers((currentWorkspaceMembers) =>
        currentWorkspaceMembers.map((workspaceMember) =>
          workspaceMember.id === response.workspaceMemberId
            ? {
                ...workspaceMember,
                username: response.username,
                isShahryarSupervisor: response.isShahryarSupervisor,
              }
            : workspaceMember,
        ),
      );
      setWorkspaceMemberId(response.workspaceMemberId);
      setUsernameDraft(response.username);
    },
    [],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setStatusTone('error');
      setStatusMessage('زانیارییەکان تەواو بکە و پاسوۆردەکان یەکسان بکە.');

      return;
    }

    setIsSubmitting(true);
    setStatusMessage(undefined);

    try {
      const response = await resetShahryarWorkspaceMemberPassword({
        workspaceMemberId: workspaceMemberId.trim(),
        newPassword,
      });

      setStatusTone('success');
      setStatusMessage(
        `پاسوۆرد نوێ کرایەوە: ${response.workspaceMemberId} | ${response.resetAt}`,
      );
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setStatusTone('error');
      setStatusMessage(
        'پاسوۆرد نوێ نەکرایەوە. تەنها ئەدمین دەتوانێت ئەم کارە بکات.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSupervisor = async () => {
    if (!canSubmitSupervisorAction) {
      return;
    }

    setIsSupervisorSubmitting(true);
    setStatusMessage(undefined);

    try {
      const response = await createShahryarSupervisor({
        workspaceMemberId: workspaceMemberId.trim(),
        username:
          usernameDraft.trim().length > 0 ? usernameDraft.trim() : undefined,
      });

      applySupervisorOperationResponse(response);
      setStatusTone('success');
      setStatusMessage('موشریف زیاد کرا.');
    } catch {
      setStatusTone('error');
      setStatusMessage('موشریف زیاد نەکرا. ڕۆڵی شاهریار یان مۆڵەتەکان بپشکنە.');
    } finally {
      setIsSupervisorSubmitting(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!canSubmitUsername) {
      setStatusTone('error');
      setStatusMessage('ناوی بەکارهێنەر بنووسە.');

      return;
    }

    setIsUsernameSubmitting(true);
    setStatusMessage(undefined);

    try {
      const response = await updateShahryarWorkspaceMemberUsername({
        workspaceMemberId: workspaceMemberId.trim(),
        username: usernameDraft.trim(),
      });

      applySupervisorOperationResponse(response);
      setStatusTone('success');
      setStatusMessage('ناوی بەکارهێنەر نوێ کرایەوە.');
    } catch {
      setStatusTone('error');
      setStatusMessage('ناوی بەکارهێنەر نوێ نەکرایەوە. دووبارەبوونەوە بپشکنە.');
    } finally {
      setIsUsernameSubmitting(false);
    }
  };

  const handleRemoveSupervisor = async () => {
    if (!canSubmitSupervisorAction) {
      return;
    }

    setIsRemovingSupervisor(true);
    setStatusMessage(undefined);

    try {
      const response = await removeShahryarSupervisor({
        workspaceMemberId: workspaceMemberId.trim(),
      });

      applySupervisorOperationResponse(response);
      setStatusTone('success');
      setStatusMessage('دەسەڵاتی کاری شاهریار لابرا.');
    } catch {
      setStatusTone('error');
      setStatusMessage('دەسەڵاتی موشریف لابرا نەکرا.');
    } finally {
      setIsRemovingSupervisor(false);
    }
  };

  return (
    <PageContainer dir="rtl">
      <PageHeader title="ئەدمین" Icon={IconUserCog} />
      <PageBody>
        <StyledContent>
          {statusMessage !== undefined && (
            <StyledStatusLine tone={statusTone}>
              {statusMessage}
            </StyledStatusLine>
          )}

          <StyledForm onSubmit={(event) => void handleSubmit(event)}>
            <StyledField>
              <span>بەکارهێنەر</span>
              {workspaceMembers.length > 0 ? (
                <StyledSelect
                  disabled={isLoadingWorkspaceMembers}
                  onChange={(event) => setWorkspaceMemberId(event.target.value)}
                  value={workspaceMemberId}
                >
                  {workspaceMembers.map((workspaceMember) => (
                    <option key={workspaceMember.id} value={workspaceMember.id}>
                      {workspaceMember.name}
                      {workspaceMember.username.length > 0
                        ? ` (${workspaceMember.username})`
                        : ''}
                    </option>
                  ))}
                </StyledSelect>
              ) : (
                <StyledInput
                  autoComplete="off"
                  dir="ltr"
                  onChange={(event) => setWorkspaceMemberId(event.target.value)}
                  value={workspaceMemberId}
                />
              )}
            </StyledField>
            {selectedWorkspaceMember !== undefined && (
              <StyledMemberMeta>
                <span dir="ltr">{selectedWorkspaceMember.userEmail}</span>
                <StyledBadge
                  tone={
                    selectedWorkspaceMember.isShahryarSupervisor
                      ? 'success'
                      : 'neutral'
                  }
                >
                  {selectedWorkspaceMember.isShahryarSupervisor
                    ? 'موشریف'
                    : 'بێ دەسەڵاتی شاهریار'}
                </StyledBadge>
              </StyledMemberMeta>
            )}
            {workspaceMembersErrorMessage !== undefined && (
              <StyledStatusLine tone="error">
                نەتوانرا لیستی بەکارهێنەرەکان وەربگیرێت؛ Workspace Member ID
                بنووسە.
              </StyledStatusLine>
            )}
            <StyledField>
              <span>پاسوۆردی نوێ</span>
              <StyledInput
                autoComplete="new-password"
                dir="ltr"
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                value={newPassword}
              />
            </StyledField>
            <StyledField>
              <span>دووبارەکردنەوەی پاسوۆرد</span>
              <StyledInput
                autoComplete="new-password"
                dir="ltr"
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                value={confirmPassword}
              />
            </StyledField>
            <StyledActions>
              <Button
                disabled={!canSubmit}
                Icon={IconKey}
                isLoading={isSubmitting}
                size="small"
                title="نوێکردنەوەی پاسوۆرد"
                type="submit"
                variant="primary"
              />
            </StyledActions>
          </StyledForm>

          <StyledSection>
            <StyledSectionTitle>ڕێکخستنی موشریف</StyledSectionTitle>
            <StyledField>
              <span>ناوی بەکارهێنەر</span>
              <StyledInput
                autoComplete="username"
                dir="ltr"
                onChange={(event) => setUsernameDraft(event.target.value)}
                value={usernameDraft}
              />
            </StyledField>
            <StyledActions>
              <Button
                disabled={
                  !canSubmitSupervisorAction ||
                  selectedWorkspaceMember?.isShahryarSupervisor === true
                }
                Icon={IconUserPlus}
                isLoading={isSupervisorSubmitting}
                onClick={() => void handleCreateSupervisor()}
                size="small"
                title="زیادکردنی موشریف"
                variant="primary"
              />
              <Button
                disabled={!canSubmitUsername}
                Icon={IconPencil}
                isLoading={isUsernameSubmitting}
                onClick={() => void handleUpdateUsername()}
                size="small"
                title="نوێکردنەوەی ناو"
                variant="secondary"
              />
              <Button
                disabled={
                  !canSubmitSupervisorAction ||
                  selectedWorkspaceMember?.isShahryarSupervisor !== true
                }
                Icon={IconTrash}
                isLoading={isRemovingSupervisor}
                onClick={() => void handleRemoveSupervisor()}
                size="small"
                title="لابردنی دەسەڵات"
                variant="secondary"
              />
            </StyledActions>
          </StyledSection>
        </StyledContent>
      </PageBody>
    </PageContainer>
  );
};
