import { isArray, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectOptionsOfSelect } from '@/polyfills/selectors/utils/collectOptionsOfSelect';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isOptionSelectedByDefault } from '@/polyfills/selectors/utils/isOptionSelectedByDefault';
import { readBooleanControlState } from '@/polyfills/selectors/utils/readBooleanControlState';
import { resolveOptionValue } from '@/polyfills/selectors/utils/resolveOptionValue';
import { resolveOwnerSelectElement } from '@/polyfills/selectors/utils/resolveOwnerSelectElement';

export const isOptionElementSelected = (
  option: SelectorElementLike,
): boolean => {
  const select = resolveOwnerSelectElement(option);
  const selectValue = select?.value;

  if (
    isDefined(select) &&
    isString(selectValue) &&
    !hasElementAttributeIgnoringCase(select, 'multiple')
  ) {
    return (
      collectOptionsOfSelect(select).find(
        (candidateOption) =>
          resolveOptionValue(candidateOption) === selectValue,
      ) === option
    );
  }

  if (isArray(selectValue)) {
    return selectValue.includes(resolveOptionValue(option));
  }

  if (readBooleanControlState({ element: option, propertyName: 'selected' })) {
    return true;
  }

  return isDefined(select) && isOptionSelectedByDefault({ option, select });
};
