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
  refetchApplicationVariables: () => Promise<unknown>;
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

  const saveApplicationVariables = async () => {
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

      // A single refetch after every mutation settled, awaited before dropping
      // the draft: per-mutation refetches can land out of order and write back
      // a snapshot taken before the last write.
      await refetchApplicationVariables();

      // Only the entries that still hold what was submitted are dropped, so a
      // variable edited again while the save was in flight keeps that edit.
      setDraftValueByKey((previousDraftValueByKey) =>
        Object.fromEntries(
          Object.entries(previousDraftValueByKey).filter(
            ([key, value]) => submittedValueByKey[key] !== (value ?? ''),
          ),
        ),
      );
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Failed to save the app settings.`,
      });
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
