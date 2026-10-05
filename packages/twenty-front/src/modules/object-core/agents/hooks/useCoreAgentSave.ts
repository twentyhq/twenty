import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { useDebouncedCallback } from 'use-debounce';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import {
  type FindOneAgentQuery,
  UpdateOneAgentDocument,
} from '~/generated-metadata/graphql';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useCoreAgentSave = ({
  agent,
  formValues,
  initialFormValues,
  isReadonlyMode,
  isRoleDirty,
  validateForm,
}: {
  agent: FindOneAgentQuery['findOneAgent'];
  formValues: CoreAgentFormValues;
  initialFormValues: CoreAgentFormValues;
  isReadonlyMode: boolean;
  isRoleDirty: boolean;
  validateForm: () => boolean;
}) => {
  const { enqueueToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalFormValues, setOriginalFormValues] =
    useState(initialFormValues);

  const [updateAgent] = useMutation(UpdateOneAgentDocument);

  const { saveDraftRoleToDB } = useSaveDraftRoleToDB({
    roleId: formValues.role || '',
    isCreateMode: false,
  });

  const saveDraftRole = async (): Promise<boolean> => {
    try {
      await saveDraftRoleToDB();

      return true;
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        enqueueToast(getToastOptionsFromError({ error }));
      } else {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        enqueueToast({
          variant: 'error',
          children: t`Failed to save role permissions: ${errorMessage}`,
        });
      }

      return false;
    }
  };

  const buildUpdateInput = (agentIdToUpdate: string) => ({
    id: agentIdToUpdate,
    name: formValues.name || '',
    label: formValues.label,
    description: formValues.description,
    icon: formValues.icon,
    modelId: formValues.modelId,
    roleId: formValues.role,
    prompt: formValues.prompt,
    modelConfiguration: formValues.modelConfiguration,
    responseFormat: formValues.responseFormat,
    // Stored triggers the form could not parse are left out of formValues, so
    // only send triggers when the user edited them to avoid deleting those
    ...(!isDeeplyEqual(formValues.triggers, originalFormValues.triggers) && {
      triggers: formValues.triggers,
    }),
  });

  const autoSave = useDebouncedCallback(async () => {
    if (isReadonlyMode || !validateForm() || isSubmitting) {
      return;
    }

    const hasChanges = !isDeeplyEqual(formValues, originalFormValues);

    if (!hasChanges && !isRoleDirty) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRoleDirty && isDefined(formValues.role)) {
        const isRoleSaved = await saveDraftRole();

        if (!isRoleSaved) {
          setIsSubmitting(false);
          return;
        }
      }

      await updateAgent({
        variables: { input: buildUpdateInput(agent.id) },
      });

      setOriginalFormValues({ ...formValues });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      setIsSubmitting(false);
    }
  }, 1_000);

  // Role permissions are edited through Jotai state by the shared roles module, so no change handler can schedule the save
  useEffect(() => {
    if (isRoleDirty) {
      autoSave();
    }
  }, [isRoleDirty, autoSave]);

  useEffect(() => {
    return () => {
      autoSave.flush();
    };
  }, [autoSave]);

  return { scheduleAutoSave: autoSave };
};
