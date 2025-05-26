import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import { Country } from '@/ui/input/components/internal/types/Country';

export const turnCountryIntoSelectableItem = (
  country: Country,
): SelectableItem => ({
  id: country.countryCode,
  name: `${country.countryName}`,
  isSelected: false,
});
