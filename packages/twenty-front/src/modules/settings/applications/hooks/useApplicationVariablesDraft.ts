import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { isNonEmptyString } from '@sniptt/guards';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';
import {
  type ApplicationVariable,
  type ApplicationVariableScope,
} from '~/generated-metadata/graphql';
import { applicationVariablesDraftFamilyState } from '@/settings/applications/states/applicationVariablesDraftFamilyState';
import { type ApplicationVariablesSaveResult } from '@/settings/applications/types/ApplicationVariablesSaveResult';

export const useApplicationVariablesDraft = <
  DraftableApplicationVariable extends Pick<
    ApplicationVariable,
    'key' | 'value' | 'isSecret'
  >,
>({
  applicationId,
  scope,
  applicationVariables,
  updateApplicationVariable,
  refetchApplicationVariables,
}: {
  applicationId: string;
  scope: ApplicationVariableScope;
  applicationVariables: DraftableApplicationVariable[];
  updateApplicationVariable: (
    applicationVariable: Pick<ApplicationVariable, 'key' | 'value'>,
  ) => Promise<unknown>;
  refetchApplicationVariables: () => Promise<{
    hasMissingRequiredVariables: boolean;
  }>;
}) => {
  const [draftValueByKey, setDraftValueByKey] = useAtomFamilyState(
    applicationVariablesDraftFamilyState,
    { applicationId, scope },
  );
  const { enqueueToast } = useToast();
  const [isSavingApplicationVariables, setIsSavingApplicationVariables] =
    useState(false);

  const draftApplicationVariables = applicationVariables.map(
    (applicationVariable) => {
      const draftValue = draftValueByKey[applicationVariable.key];
      const isCleared = draftValue === null;

      // A saved secret arrives masked, so editing it in place would corrupt it.
      const savedValueToEdit = applicationVariable.isSecret
        ? ''
        : applicationVariable.value;

      return {
        ...applicationVariable,
        value: isCleared ? '' : (draftValue ?? savedValueToEdit),
        savedValue: applicationVariable.value,
        isCleared,
      };
    },
  );

  const editedApplicationVariables = draftApplicationVariables.filter(
    ({ value, savedValue, isSecret, isCleared }) =>
      isCleared || (isSecret ? isNonEmptyString(value) : value !== savedValue),
  );

  const setApplicationVariableValue = (key: string, value: string) => {
    setDraftValueByKey((previousDraftValueByKey) => ({
      ...previousDraftValueByKey,
      [key]: value,
    }));
  };

  const clearApplicationVariableValue = (key: string) => {
    setDraftValueByKey((previousDraftValueByKey) => ({
      ...previousDraftValueByKey,
      [key]: null,
    }));
  };

  const saveApplicationVariables =
    async (): Promise<ApplicationVariablesSaveResult> => {
      const submittedValueByKey = Object.fromEntries(
        editedApplicationVariables.map(({ key, value }) => [key, value]),
      );

      setIsSavingApplicationVariables(true);

      try {
        await Promise.all(
          Object.entries(submittedValueByKey).map(([key, value]) =>
            updateApplicationVariable({ key, value }),
          ),
        );

        // Refetch once after all writes to avoid restoring a partial snapshot.
        const { hasMissingRequiredVariables } =
          await refetchApplicationVariables();

        // Preserve edits made while the save was in flight.
        setDraftValueByKey((previousDraftValueByKey) =>
          Object.fromEntries(
            Object.entries(previousDraftValueByKey).filter(
              ([key, value]) => submittedValueByKey[key] !== (value ?? ''),
            ),
          ),
        );

        return { isSaved: true, hasMissingRequiredVariables };
      } catch {
        enqueueToast({
          status: 'error',
          children: t`Failed to save the app settings.`,
        });

        return { isSaved: false };
      } finally {
        setIsSavingApplicationVariables(false);
      }
    };

  return {
    draftApplicationVariables,
    setApplicationVariableValue,
    clearApplicationVariableValue,
    hasUnsavedApplicationVariables: editedApplicationVariables.length > 0,
    saveApplicationVariables,
    isSavingApplicationVariables,
  };
};
