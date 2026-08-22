import { useEffect, useState } from 'react';
import { type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { type SettingsDataModelFieldSelectFormValues } from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { generateNewSelectOption } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOption';

type UseApplyNewSelectOptionFromSearchParamsParams = {
  getValues: UseFormGetValues<SettingsDataModelFieldSelectFormValues>;
  setValue: UseFormSetValue<SettingsDataModelFieldSelectFormValues>;
};

// This has to live in the component owning the form: react-hook-form only
// starts computing the dirty state once that component has mounted, so an
// option written from the select form below it leaves the form pristine and
// the Save button disabled.
export const useApplyNewSelectOptionFromSearchParams = ({
  getValues,
  setValue,
}: UseApplyNewSelectOptionFromSearchParamsParams) => {
  const [searchParams] = useSearchParams();

  const [hasAppliedNewOption, setHasAppliedNewOption] = useState(false);

  useEffect(() => {
    const newOptionLabel = searchParams.get('newOption');

    if (!isDefined(newOptionLabel) || hasAppliedNewOption) {
      return;
    }

    const currentOptions = getValues('options');

    if (!isDefined(currentOptions)) {
      return;
    }

    setHasAppliedNewOption(true);

    setValue(
      'options',
      [
        ...currentOptions,
        generateNewSelectOption(currentOptions, newOptionLabel),
      ],
      { shouldDirty: true },
    );
  }, [searchParams, hasAppliedNewOption, getValues, setValue]);
};
