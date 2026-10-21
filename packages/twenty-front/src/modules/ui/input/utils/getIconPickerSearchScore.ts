import { getIconPickerLabel } from '@/ui/input/utils/getIconPickerLabel';

const WHITESPACE = /\s/g;
const ICON_LABEL_PREFIX = 'icon ';
const ICON_KEY_PREFIX = 'icon';

const getMatchScore = ({ value, query }: { value: string; query: string }) => {
  if (value === query) {
    return 100;
  }

  if (value.startsWith(query)) {
    return 75;
  }

  if (value.includes(query)) {
    return 50;
  }

  return 0;
};

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
  const query = search.toLowerCase().trim().replace(WHITESPACE, '');
  const labelScore = getMatchScore({ value: iconLabel, query });

  if (!query.startsWith(ICON_KEY_PREFIX)) {
    return labelScore;
  }

  return Math.max(
    labelScore,
    getMatchScore({ value: iconKey.toLowerCase(), query }),
  );
};
