import { type SelectOption } from 'twenty-ui/primitives/input';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const filterSelectOptionsBySearch = ({
  options,
  searchFilter,
}: {
  options: SelectOption[];
  searchFilter: string;
}) => {
  const searchTerm = normalizeSearchText(searchFilter);

  return options.filter((option) =>
    normalizeSearchText(option.label).includes(searchTerm),
  );
};
