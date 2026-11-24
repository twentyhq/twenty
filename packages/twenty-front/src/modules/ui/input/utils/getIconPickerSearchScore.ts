import { getSearchMatchScore } from 'twenty-ui/utilities';

import { getIconPickerLabel } from '@/ui/input/utils/getIconPickerLabel';

const WHITESPACE = /\s/g;
const ICON_LABEL_PREFIX = 'icon ';
const ICON_KEY_PREFIX = 'icon';

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
  const labelScore = getSearchMatchScore({ value: iconLabel, query });

  if (!query.startsWith(ICON_KEY_PREFIX)) {
    return labelScore;
  }

  return Math.max(
    labelScore,
    getSearchMatchScore({ value: iconKey.toLowerCase(), query }),
  );
};
