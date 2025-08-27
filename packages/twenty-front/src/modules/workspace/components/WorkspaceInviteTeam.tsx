import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { sanitizeEmailList } from '@/workspace/utils/sanitizeEmailList';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconSend } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useCreateWorkspaceInvitation } from '../../workspace-invitation/hooks/useCreateWorkspaceInvitation';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const emailValidationSchema = (email: string) =>
  z.string().email(`Invalid email '${email}'`);

const validationSchema = () =>
  z
    .object({
      emails: z.string().superRefine((value, ctx) => {
        if (!value.length) {
          return;
        }
        const emails = sanitizeEmailList(value.split(','));
        if (emails.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_string,
            message: 'Emails should not be empty',
            validation: 'email',
          });
        }
        const invalidEmails: string[] = [];
        for (const email of emails) {
          const result = emailValidationSchema(email).safeParse(email);
          if (!result.success) {
            invalidEmails.push(email);
          }
        }
        if (invalidEmails.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_string,
            message:
              invalidEmails.length > 1
                ? 'Emails "' + invalidEmails.join('", "') + '" are invalid'
                : 'Email "' + invalidEmails.join('", "') + '" is invalid',
            validation: 'email',
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
      resolver: zodResolver(validationSchema()),
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
      enqueueSuccessSnackBar({
        message: `${data.sendInvitations.result.length} invitations sent`,
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
