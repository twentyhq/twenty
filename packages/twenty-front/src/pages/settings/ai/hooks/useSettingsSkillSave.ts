import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  CreateSkillDocument,
  type FindOneSkillQuery,
  UpdateSkillDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useAutoSaveOnChange } from '~/pages/settings/ai/hooks/useAutoSaveOnChange';
import { type SettingsSkillFormValues } from '~/pages/settings/ai/types/SettingsSkillFormValues';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSettingsSkillSave = ({
  skill,
  formValues,
  initialFormValues,
  isReadonlyMode,
  validateForm,
}: {
  skill?: Pick<NonNullable<FindOneSkillQuery['skill']>, 'id'>;
  formValues: SettingsSkillFormValues;
  initialFormValues: SettingsSkillFormValues;
  isReadonlyMode: boolean;
  validateForm: () => boolean;
}) => {
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalFormValues, setOriginalFormValues] =
    useState(initialFormValues);

  const [createSkill] = useMutation(CreateSkillDocument);
  const [updateSkill] = useMutation(UpdateSkillDocument);

  const buildInput = () => ({
    name: formValues.name,
    label: formValues.label,
    description: formValues.description || undefined,
    content: formValues.content,
    icon: formValues.icon || undefined,
  });

  const autoSave = useDebouncedCallback(async () => {
    if (
      !isDefined(skill) ||
      isReadonlyMode ||
      !validateForm() ||
      isSubmitting
    ) {
      return;
    }

    if (isDeeplyEqual(formValues, originalFormValues)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateSkill({
        variables: {
          input: { id: skill.id, ...buildInput() },
        },
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

  useAutoSaveOnChange({
    autoSave,
    isEnabled: isDefined(skill),
    watchedValue: formValues,
  });

  const handleSave = async () => {
    if (isReadonlyMode || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isDefined(skill)) {
        await createSkill({
          variables: {
            input: buildInput(),
          },
        });
        navigate(SettingsPath.AI);
        return;
      }

      await updateSkill({
        variables: {
          input: { id: skill.id, ...buildInput() },
        },
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

  return { handleSave, isSubmitting };
};
