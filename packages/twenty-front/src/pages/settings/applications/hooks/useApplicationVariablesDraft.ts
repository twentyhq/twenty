import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  type ApplicationVariable,
  type ApplicationVariableScope,
} from '~/generated-metadata/graphql';
import { applicationVariablesDraftFamilyState } from '~/pages/settings/applications/states/applicationVariablesDraftFamilyState';

export const useApplicationVariablesDraft = <
  DraftableApplicationVariable extends Pick<
    ApplicationVariable,
    'key' | 'value'
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

      return isDefined(draftValue)
        ? { ...applicationVariable, value: draftValue }
        : applicationVariable;
    },
  );

  const editedApplicationVariables = draftApplicationVariables.filter(
    (draftApplicationVariable, index) =>
      draftApplicationVariable.value !== applicationVariables[index].value,
  );

  const setApplicationVariableValue = (key: string, value: string) => {
    setDraftValueByKey((previousDraftValueByKey) => ({
      ...previousDraftValueByKey,
      [key]: value,
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
            ([key, value]) => submittedValueByKey[key] !== value,
          ),
        ),
      );
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to save the app settings.`,
      });
    } finally {
      setIsSavingApplicationVariables(false);
    }
  };

  return {
    draftApplicationVariables,
    setApplicationVariableValue,
    hasUnsavedApplicationVariables: editedApplicationVariables.length > 0,
    saveApplicationVariables,
    isSavingApplicationVariables,
  };
};
