import { useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { useDebouncedCallback } from 'use-debounce';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  CreateSkillDocument,
  type FindOneSkillQuery,
  UpdateSkillDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
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
  const { enqueueToast } = useToast();
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
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      setIsSubmitting(false);
    }
  }, 1_000);

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
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSave, isSubmitting, scheduleAutoSave: autoSave };
};
