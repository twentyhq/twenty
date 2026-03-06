import { styled } from '@linaria/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';
import { sanitizeEmailList } from '@/workspace/utils/sanitizeEmailList';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconLock,
  IconSend,
  IconUser,
  useIcons,
  type IconComponent,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-wrap: wrap;
  }
`;

const StyledLinkContainer = styled.div`
  flex: 1 1 auto;
  min-width: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex: 1 1 100%;
  }
`;

const StyledRoleContainer = styled.div`
  flex: 0 0 130px;
  min-width: 130px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex: 1 1 100%;
  }
`;

const emailsEmptyErrorMessage = msg`Emails should not be empty`;

const validationSchema = z.object({
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
  roleId: z.string().optional(),
});

type FormInput = {
  emails: string;
  roleId?: string;
};

type WorkspaceInviteTeamProps = {
  roles: RoleWithPartialMembers[];
};

export const WorkspaceInviteTeam = ({ roles }: WorkspaceInviteTeamProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { sendInvitation } = useCreateWorkspaceInvitation();

  const roleOptions: Array<{
    label: string;
    value: string;
    Icon?: IconComponent;
  }> = roles
    .filter((role) => role.canBeAssignedToUsers)
    .map((role) => ({
      label: role.label,
      value: role.id,
      Icon: getIcon(role.icon) ?? IconUser,
    }));

  const emptyRoleOption = {
    label: t`Default role`,
    value: '',
    Icon: IconLock,
  };

  const { reset, handleSubmit, control, formState, watch } = useForm<FormInput>(
    {
      mode: 'onSubmit',
      resolver: zodResolver(validationSchema),
      defaultValues: {
        emails: '',
        roleId: '',
      },
    },
  );
  const isEmailsEmpty = !watch('emails');

  const submit = handleSubmit(async ({ emails, roleId }) => {
    const emailsList = sanitizeEmailList(emails.split(','));
    const { data } = await sendInvitation({
      emails: emailsList,
      ...(roleId ? { roleId } : {}),
    });
    if (!isDefined(data)) {
      return;
    }

    if (data.sendInvitations.result.length > 0) {
      const invitationCount = data.sendInvitations.result.length;
      enqueueSuccessSnackBar({
        message: t`${invitationCount} invitations sent`,
        options: {
          duration: 2000,
        },
      });

      return;
    }

    if (!data.sendInvitations.success) {
      enqueueErrorSnackBar({
        message: data.sendInvitations.errors.join(', '),
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
                  // oxlint-disable-next-line lingui/no-unlocalized-strings
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
        <StyledRoleContainer>
          <Controller
            name="roleId"
            control={control}
            render={({ field: { value, onChange } }) => {
              return (
                <Select
                  dropdownId="workspace-invite-team-role"
                  options={roleOptions}
                  emptyOption={emptyRoleOption}
                  value={value}
                  onChange={onChange}
                  withSearchInput
                  fullWidth
                  disabled={roleOptions.length === 0}
                />
              );
            }}
          />
        </StyledRoleContainer>
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
