import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { generateNewSelectOption } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOption';

type UseApplyNewSelectOptionFromSearchParamsParams = {
  fieldMetadataId: string | undefined;
  getValues: (name: 'options') => FieldMetadataItemOption[] | undefined;
  setValue: (
    name: 'options',
    options: FieldMetadataItemOption[],
    config: { shouldDirty: boolean },
  ) => void;
};

// This has to live in the component owning the form: react-hook-form only
// starts computing the dirty state once that component has mounted, so an
// option written from the select form below it leaves the form pristine and
// the Save button disabled.
export const useApplyNewSelectOptionFromSearchParams = ({
  fieldMetadataId,
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

    // The field only registers once its metadata has resolved, so this waits
    // for the next field instead of giving up on the first miss.
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
  }, [searchParams, hasAppliedNewOption, fieldMetadataId, getValues, setValue]);
};
