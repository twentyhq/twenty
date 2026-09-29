import { isBookCallOnboardingStepEnabledState } from '@/client-config/states/isBookCallOnboardingStepEnabledState';
import { isCompanyEnrichmentEnabledState } from '@/client-config/states/isCompanyEnrichmentEnabledState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { ONBOARDING_SKIP_DIALOG_IDS } from '@/onboarding/constants/OnboardingSkipDialogIds';
import { useOnboardingStepEnterHotkey } from '@/onboarding/hooks/useOnboardingStepEnterHotkey';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingInviteTeamEmailsDraftState } from '@/onboarding/states/onboardingInviteTeamEmailsDraftState';
import { getInviteTeamCreditsReward } from '@/onboarding/utils/getInviteTeamCreditsReward';
import { getValidInviteEmails } from '@/onboarding/utils/getValidInviteEmails';
import { waitForCompanyEnrichmentSettlement } from '@/onboarding/utils/waitForCompanyEnrichmentSettlement';
import { PageFocusId } from '@/types/PageFocusId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';
import { sanitizeEmailList } from '@/workspace/utils/sanitizeEmailList';
import { useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { z } from 'zod';
import { GetInviteSuggestionsDocument } from '~/generated-metadata/graphql';

const validationSchema = z.object({
  emails: z.array(z.object({ email: z.union([z.literal(''), z.email()]) })),
});

type InviteTeamFormInput = z.infer<typeof validationSchema>;

export const useInviteTeam = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { sendInvitation } = useCreateWorkspaceInvitation();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const isBookCallOnboardingStepEnabled = useAtomStateValue(
    isBookCallOnboardingStepEnabledState,
  );
  const isCompanyEnrichmentEnabled = useAtomStateValue(
    isCompanyEnrichmentEnabledState,
  );
  const store = useStore();
  const { openDialog } = useDialog();

  const [isNavigating, setIsNavigating] = useState(false);
  const [emailIndexToFocus, setEmailIndexToFocus] = useState(0);
  const onboardingInviteTeamEmailsDraft = useAtomStateValue(
    onboardingInviteTeamEmailsDraftState,
  );

  const setInviteTeamFreeCredits = useCallback(
    (invitedTeammatesCount: number) =>
      setOnboardingStepFreeCredits(
        'inviteTeam',
        getInviteTeamCreditsReward({
          invitedTeammatesCount,
          onboardingConfig,
        }),
      ),
    [onboardingConfig, setOnboardingStepFreeCredits],
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    trigger,
    getFieldState,
    formState: { isValid, isSubmitting, isDirty },
  } = useForm<InviteTeamFormInput>({
    mode: 'onChange',
    defaultValues: {
      emails: isDefined(onboardingInviteTeamEmailsDraft)
        ? onboardingInviteTeamEmailsDraft.map((email) => ({ email }))
        : [{ email: '' }, { email: '' }, { email: '' }],
    },
    resolver: zodResolver(validationSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emails',
  });

  const [hasPrefilledSuggestions, setHasPrefilledSuggestions] = useState(
    isDefined(onboardingInviteTeamEmailsDraft),
  );

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
      store.set(
        onboardingInviteTeamEmailsDraftState.atom,
        emailValues.map((email) => email ?? ''),
      );
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
  }, [watch, append, remove, store]);

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
      const emails = sanitizeEmailList(
        data.emails.map((emailData) => emailData.email),
      );

      setIsNavigating(true);

      try {
        // Only wait when enrichment is actually going to run, otherwise the
        // settlement never resolves and every submit burns the full timeout.
        const companyEnrichmentSettlement =
          isBookCallOnboardingStepEnabled && isCompanyEnrichmentEnabled
            ? waitForCompanyEnrichmentSettlement({ store })
            : Promise.resolve();

        const result = await sendInvitation({ emails });

        if (isDefined(result.error)) {
          throw result.error;
        }

        const sentInvitationsCount =
          result.data?.sendInvitations.result.length ?? 0;
        const invitationErrors = result.data?.sendInvitations.errors ?? [];

        setInviteTeamFreeCredits(sentInvitationsCount);

        if (
          sentInvitationsCount === 0 &&
          isNonEmptyArray(emails) &&
          isNonEmptyArray(invitationErrors)
        ) {
          enqueueToast({
            variant: 'error',
            children: invitationErrors.join(', '),
            duration: 5000,
          });
        }

        if (sentInvitationsCount > 0) {
          enqueueToast({
            variant: 'success',
            children: t`Invite link sent to email addresses`,
            duration: 2000,
          });
        }

        await companyEnrichmentSettlement;

        setNextOnboardingStatus({
          stepHistoryEffect:
            sentInvitationsCount > 0
              ? 'clearAfterIrreversibleStep'
              : 'recordAsReversible',
        });
      } catch (error) {
        setIsNavigating(false);

        throw error;
      }
    },
    [
      enqueueToast,
      isBookCallOnboardingStepEnabled,
      isCompanyEnrichmentEnabled,
      sendInvitation,
      setNextOnboardingStatus,
      setInviteTeamFreeCredits,
      store,
      t,
    ],
  );

  const handleSkip = async () => {
    await onSubmit({ emails: [] });
  };

  const openSkipDialog = async () => {
    await trigger();

    const firstInvalidEmailIndex = getValues('emails').findIndex(
      (_, index) => getFieldState(`emails.${index}.email`).invalid,
    );

    setEmailIndexToFocus(Math.max(firstInvalidEmailIndex, 0));
    openDialog(ONBOARDING_SKIP_DIALOG_IDS.inviteTeam);
  };

  const handleInvite = () => {
    if (isSubmitting || isNavigating) {
      return;
    }

    const hasInviteEmails = isNonEmptyArray(
      getValidInviteEmails(getValues('emails').map(({ email }) => email)),
    );

    if (!hasInviteEmails) {
      void openSkipDialog();
      return;
    }

    void handleSubmit(onSubmit)();
  };

  useOnboardingStepEnterHotkey({
    focusId: PageFocusId.InviteTeam,
    onEnter: handleInvite,
  });

  return {
    control,
    fields,
    remove,
    handleSkip,
    handleInvite,
    openSkipDialog,
    emailIndexToFocus,
    getPlaceholder,
    isValid,
    isSubmitting,
    isNavigating,
  };
};
