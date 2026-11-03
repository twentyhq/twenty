import { type SelectOption } from 'twenty-ui/primitives/input';
import { normalizeSearchText } from 'twenty-ui/utilities';

export const filterSelectOptionsBySearch = <TOption extends SelectOption>({
  options,
  searchFilter,
}: {
  options: TOption[];
  searchFilter: string;
}) => {
  const searchTerm = normalizeSearchText(searchFilter);

  return options.filter((option) =>
    normalizeSearchText(option.label).includes(searchTerm),
  );
};
