import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type CreateAgentInput,
  CreateOneAgentDocument,
  type FindOneAgentQuery,
  UpdateOneAgentDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { type SettingsAiAgentFormValues } from '~/pages/settings/ai/validation-schemas/settingsAiAgentFormSchema';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSettingsAgentSave = ({
  agent,
  formValues,
  initialFormValues,
  isReadonlyMode,
  isRoleDirty,
  validateForm,
}: {
  agent?: FindOneAgentQuery['findOneAgent'];
  formValues: SettingsAiAgentFormValues;
  initialFormValues: SettingsAiAgentFormValues;
  isReadonlyMode: boolean;
  isRoleDirty: boolean;
  validateForm: () => boolean;
}) => {
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalFormValues, setOriginalFormValues] =
    useState(initialFormValues);

  const [createAgent] = useMutation(CreateOneAgentDocument);
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
        enqueueErrorSnackBar({
          apolloError: error,
        });
      } else {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        enqueueErrorSnackBar({
          message: t`Failed to save role permissions: ${errorMessage}`,
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
    evaluationInputs: formValues.evaluationInputs,
  });

  const autoSave = useDebouncedCallback(async () => {
    if (
      !isDefined(agent) ||
      isReadonlyMode ||
      !validateForm() ||
      isSubmitting
    ) {
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
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, 1_000);

  // Role permissions are edited by the shared roles module through Jotai
  // state, so there is no change handler to schedule the save from.
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

  const handleSave = async () => {
    if (isReadonlyMode || !validateForm()) {
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

      if (!isDefined(agent)) {
        const input: CreateAgentInput = {
          name: formValues.name,
          label: formValues.label,
          description: formValues.description,
          icon: formValues.icon,
          modelId: formValues.modelId,
          roleId: formValues.role,
          prompt: formValues.prompt,
          modelConfiguration: formValues.modelConfiguration,
          responseFormat: formValues.responseFormat,
          evaluationInputs: formValues.evaluationInputs,
        };

        await createAgent({
          variables: { input },
        });
        navigate(SettingsPath.AI);
        return;
      }

      await updateAgent({
        variables: { input: buildUpdateInput(agent.id) },
      });

      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSave, isSubmitting, scheduleAutoSave: autoSave };
};
