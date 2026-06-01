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
import { IconKey, IconUserCog } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SHAHRYAR_COLORS } from '@/shahryar/constants/shahryar-colors';
import {
  fetchShahryarAdminWorkspaceMembers,
  resetShahryarWorkspaceMemberPassword,
} from '@/shahryar/services/shahryarReportApi';
import { type ShahryarAdminWorkspaceMember } from '@/shahryar/types/shahryarAdminApi';

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
  justify-content: flex-end;
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [statusTone, setStatusTone] = useState<'error' | 'success'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingWorkspaceMembers, setIsLoadingWorkspaceMembers] =
    useState(false);
  const [workspaceMembersErrorMessage, setWorkspaceMembersErrorMessage] =
    useState<string | undefined>();
  const selectedWorkspaceMember = workspaceMembers.find(
    (workspaceMember) => workspaceMember.id === workspaceMemberId,
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
        'پاسوۆرد نوێ نەکرایەوە. تەنها تەدمین دەتوانێت ئەم کارە بکات.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer dir="rtl">
      <PageHeader title="تەدمین" Icon={IconUserCog} />
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
              <StyledStatusLine tone="success">
                {selectedWorkspaceMember.userEmail}
              </StyledStatusLine>
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
        </StyledContent>
      </PageBody>
    </PageContainer>
  );
};
