import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectOptionsOfSelect } from '@/polyfills/selectors/utils/collectOptionsOfSelect';
import { hasElementAttributeIgnoringCase } from '@/polyfills/selectors/utils/hasElementAttributeIgnoringCase';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { readBooleanControlState } from '@/polyfills/selectors/utils/readBooleanControlState';

export const isOptionSelectedByDefault = ({
  option,
  select,
}: {
  option: SelectorElementLike;
  select: SelectorElementLike;
}): boolean => {
  if (hasElementAttributeIgnoringCase(select, 'multiple')) {
    return false;
  }

  const options = collectOptionsOfSelect(select);

  if (
    options.some((candidateOption) =>
      readBooleanControlState({
        element: candidateOption,
        propertyName: 'selected',
      }),
    )
  ) {
    return false;
  }

  return (
    options.find((candidateOption) => !isElementDisabled(candidateOption)) ===
    option
  );
};
