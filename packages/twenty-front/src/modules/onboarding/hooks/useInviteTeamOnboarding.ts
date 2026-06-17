import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const validationSchema = z.object({
  emails: z.array(z.object({ email: z.union([z.literal(''), z.email()]) })),
});

export type InviteTeamFormInput = z.infer<typeof validationSchema>;

export const useInviteTeamOnboarding = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { sendInvitation } = useCreateWorkspaceInvitation();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);
  const hasCalendarBooking = isDefined(calendarBookingPageId);

  const form = useForm<InviteTeamFormInput>({
    mode: 'onChange',
    defaultValues: {
      emails: [{ email: '' }, { email: '' }, { email: '' }],
    },
    resolver: zodResolver(validationSchema),
  });

  const { control, handleSubmit, watch } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emails',
  });

  watch(({ emails }) => {
    if (!emails) {
      return;
    }
    const emailValues = emails.map((email) => email?.email);
    if (emailValues[emailValues.length - 1] !== '') {
      append({ email: '' });
    }
    if (emailValues.length > 3 && emailValues[emailValues.length - 2] === '') {
      remove(emailValues.length - 1);
    }
  });

  const getPlaceholder = (emailIndex: number) => {
    if (emailIndex === 0) {
      return 'tim@apple.com';
    }
    if (emailIndex === 1) {
      return 'phil@apple.com';
    }
    if (emailIndex === 2) {
      return 'jony@apple.com';
    }
    return 'craig@apple.com';
  };

  const copyInviteLink = () => {
    if (isDefined(currentWorkspace?.inviteHash)) {
      const inviteLink = `${window.location.origin}/invite/${currentWorkspace?.inviteHash}`;
      copyToClipboard(inviteLink, t`Link copied to clipboard`);
    }
  };

  const onSubmit: SubmitHandler<InviteTeamFormInput> = useCallback(
    async (data) => {
      const emails = Array.from(
        new Set(
          data.emails
            .map((emailData) => emailData.email.trim())
            .filter((email) => email.length > 0),
        ),
      );

      const result = await sendInvitation({ emails });

      if (isDefined(result.error)) {
        throw result.error;
      }

      if (emails.length > 0) {
        enqueueSuccessSnackBar({
          message: t`Invite link sent to email addresses`,
          options: {
            duration: 2000,
          },
        });
      }

      setNextOnboardingStatus();
    },
    [enqueueSuccessSnackBar, sendInvitation, setNextOnboardingStatus, t],
  );

  const handleSkip = async () => {
    await onSubmit({ emails: [] });
  };

  return {
    control,
    fields,
    handleSubmit,
    onSubmit,
    handleSkip,
    getPlaceholder,
    copyInviteLink,
    currentWorkspace,
    hasCalendarBooking,
    isValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
  };
};
