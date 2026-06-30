import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { type Currency } from '@/ui/input/components/internal/types/Currency';

export const turnCurrencyIntoSelectableItem = (
  currency: Currency,
): SelectableItem => ({
  id: currency.value,
  AvatarIcon: currency.Icon,
  avatarType: 'icon',
  name: `${currency.label}`,
  isSelected: false,
});
