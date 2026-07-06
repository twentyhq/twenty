import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { PageFocusId } from '@/types/PageFocusId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { GetInviteSuggestionsDocument } from '~/generated-metadata/graphql';
import { z } from 'zod';

const validationSchema = z.object({
  emails: z.array(z.object({ email: z.union([z.literal(''), z.email()]) })),
});

type InviteTeamFormInput = z.infer<typeof validationSchema>;

export const useInviteTeam = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { sendInvitation } = useCreateWorkspaceInvitation();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const onboardingConfig = useAtomStateValue(onboardingConfigState);

  const [isNavigating, setIsNavigating] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isValid, isSubmitting, isDirty },
  } = useForm<InviteTeamFormInput>({
    mode: 'onChange',
    defaultValues: {
      emails: [{ email: '' }, { email: '' }, { email: '' }],
    },
    resolver: zodResolver(validationSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emails',
  });

  const [hasPrefilledSuggestions, setHasPrefilledSuggestions] = useState(false);

  const { data: inviteSuggestionsData } = useQuery(
    GetInviteSuggestionsDocument,
    {
      fetchPolicy: 'cache-first',
    },
  );

  const inviteSuggestions = useMemo(
    () => inviteSuggestionsData?.getInviteSuggestions ?? [],
    [inviteSuggestionsData],
  );
  const hasInviteSuggestions = inviteSuggestions.length > 0;

  useEffect(() => {
    if (hasPrefilledSuggestions || !hasInviteSuggestions || isDirty) {
      return;
    }

    setHasPrefilledSuggestions(true);
    reset({
      emails: [
        ...inviteSuggestions.map((suggestion) => ({ email: suggestion.email })),
        { email: '' },
      ],
    });
  }, [
    hasPrefilledSuggestions,
    hasInviteSuggestions,
    inviteSuggestions,
    isDirty,
    reset,
  ]);

  useEffect(() => {
    const subscription = watch(({ emails }) => {
      if (!emails) {
        return;
      }
      const emailValues = emails.map((email) => email?.email);
      if (emailValues[emailValues.length - 1] !== '') {
        append({ email: '' });
      }
      if (
        emailValues.length > 3 &&
        emailValues[emailValues.length - 2] === ''
      ) {
        remove(emailValues.length - 1);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, append, remove]);

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

      const creditsRewardPerUser =
        onboardingConfig?.inviteTeamCreditsRewardPerUser ?? 0;

      setOnboardingFreeCredits((current) => ({
        ...current,
        inviteTeam: emails.length * creditsRewardPerUser,
      }));

      if (emails.length > 0) {
        enqueueSuccessSnackBar({
          message: t`Invite link sent to email addresses`,
          options: {
            duration: 2000,
          },
        });
      }

      setNextOnboardingStatus();
      setIsNavigating(true);
    },
    [
      enqueueSuccessSnackBar,
      onboardingConfig?.inviteTeamCreditsRewardPerUser,
      sendInvitation,
      setNextOnboardingStatus,
      setOnboardingFreeCredits,
      t,
    ],
  );

  const handleSkip = async () => {
    await onSubmit({ emails: [] });
  };

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: () => {
      handleSubmit(onSubmit)();
    },
    focusId: PageFocusId.InviteTeam,
    dependencies: [handleSubmit, onSubmit],
  });

  return {
    control,
    fields,
    remove,
    handleSubmit,
    onSubmit,
    handleSkip,
    getPlaceholder,
    isValid,
    isSubmitting,
    isNavigating,
  };
};
