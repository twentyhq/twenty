import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';
import { type ApplicationVariable } from '~/generated-metadata/graphql';
import { useUpdateOneApplicationVariable } from '~/pages/settings/applications/hooks/useUpdateOneApplicationVariable';
import { applicationVariablesDraftFamilyState } from '~/pages/settings/applications/states/applicationVariablesDraftFamilyState';

export const useApplicationVariablesDraft = ({
  applicationId,
  applicationVariables,
}: {
  applicationId: string;
  applicationVariables: ApplicationVariable[];
}) => {
  const [draftValueByKey, setDraftValueByKey] = useAtomFamilyState(
    applicationVariablesDraftFamilyState,
    applicationId,
  );
  const { updateOneApplicationVariable } = useUpdateOneApplicationVariable();
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
    setIsSavingApplicationVariables(true);

    try {
      await Promise.all(
        editedApplicationVariables.map(({ key, value }) =>
          updateOneApplicationVariable({ key, value, applicationId }),
        ),
      );

      setDraftValueByKey({});
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
