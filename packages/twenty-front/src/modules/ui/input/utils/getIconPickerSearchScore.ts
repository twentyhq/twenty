import { getIconPickerLabel } from '@/ui/input/utils/getIconPickerLabel';

const WHITESPACE = /\s/g;
const ICON_LABEL_PREFIX = 'icon ';

export const getIconPickerSearchScore = ({
  iconKey,
  search,
}: {
  iconKey: string;
  search: string;
}) => {
  const iconLabel = getIconPickerLabel(iconKey)
    .toLowerCase()
    .replace(ICON_LABEL_PREFIX, '')
    .replace(WHITESPACE, '');
  const normalizedKey = iconKey.toLowerCase();
  const query = search.toLowerCase().trim().replace(WHITESPACE, '');

  if (normalizedKey === query || iconLabel === query) {
    return 100;
  }

  if (normalizedKey.startsWith(query) || iconLabel.startsWith(query)) {
    return 75;
  }

  if (normalizedKey.includes(query) || iconLabel.includes(query)) {
    return 50;
  }

  return 0;
};
