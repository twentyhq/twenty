import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { sanitizeEmailList } from '@/workspace/utils/sanitizeEmailList';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconSend } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const emailsEmptyErrorMessage = msg`Emails should not be empty`;

const validationSchema = z
  .object({
    emails: z.string().superRefine((value, ctx) => {
      if (!value.length) {
        return;
      }
      const emails = sanitizeEmailList(value.split(','));
      if (emails.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: i18n._(emailsEmptyErrorMessage),
        });
      }
      const invalidEmails: string[] = [];
      for (const email of emails) {
        const result = z.email().safeParse(email);
        if (!result.success) {
          invalidEmails.push(email);
        }
      }
      if (invalidEmails.length > 0) {
        const invalidEmailsList = invalidEmails.join(', ');
        ctx.addIssue({
          code: 'custom',
          message:
            invalidEmails.length > 1
              ? `Invalid emails: ${invalidEmailsList}`
              : `Invalid email: ${invalidEmailsList}`,
        });
      }
    }),
  })
  .required();

type FormInput = {
  emails: string;
};

export const WorkspaceInviteTeam = () => {
  const { t } = useLingui();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { sendInvitation } = useCreateWorkspaceInvitation();

  const { reset, handleSubmit, control, formState, watch } = useForm<FormInput>(
    {
      mode: 'onSubmit',
      resolver: zodResolver(validationSchema),
      defaultValues: {
        emails: '',
      },
    },
  );
  const isEmailsEmpty = !watch('emails');

  const submit = handleSubmit(async ({ emails }) => {
    const emailsList = sanitizeEmailList(emails.split(','));
    const { data } = await sendInvitation({ emails: emailsList });
    if (isDefined(data) && data.sendInvitations.result.length > 0) {
      const invitationCount = data.sendInvitations.result.length;
      enqueueSuccessSnackBar({
        message: t`${invitationCount} invitations sent`,
        options: {
          duration: 2000,
        },
      });
      return;
    }
    if (isDefined(data) && !data.sendInvitations.success) {
      enqueueErrorSnackBar({
        options: {
          duration: 5000,
        },
      });
    }
  });

  const { isSubmitSuccessful, errors } = formState;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <form onSubmit={submit}>
      <StyledContainer>
        <StyledLinkContainer>
          <Controller
            name="emails"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => {
              return (
                <SettingsTextInput
                  instanceId="workspace-invite-team-emails"
                  // eslint-disable-next-line lingui/no-unlocalized-strings
                  placeholder="tim@apple.com, jony.ive@apple.dev"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  fullWidth
                />
              );
            }}
          />
        </StyledLinkContainer>
        <Button
          Icon={IconSend}
          variant="primary"
          accent="blue"
          title={t`Invite`}
          type="submit"
          disabled={isEmailsEmpty || !!errors.emails}
        />
      </StyledContainer>
    </form>
  );
};
