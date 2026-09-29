import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const isSelectOptionMatchingSearch = ({
  option: { label, searchKeywords },
  normalizedSearchInputValue,
}: {
  option: Pick<SelectOption, 'label' | 'searchKeywords'>;
  normalizedSearchInputValue: string;
}) => {
  if (!isNonEmptyString(normalizedSearchInputValue)) {
    return true;
  }

  return (
    normalizeSearchText(label).includes(normalizedSearchInputValue) ||
    (isDefined(searchKeywords) &&
      normalizeSearchText(searchKeywords).includes(normalizedSearchInputValue))
  );
};
