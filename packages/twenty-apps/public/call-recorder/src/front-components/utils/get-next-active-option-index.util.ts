export type SettingsSelectNavigationKey =
  | 'ArrowDown'
  | 'ArrowUp'
  | 'Home'
  | 'End';

export const getNextActiveOptionIndex = ({
  key,
  currentIndex,
  optionCount,
}: {
  key: SettingsSelectNavigationKey;
  currentIndex: number;
  optionCount: number;
}): number => {
  if (optionCount <= 0) {
    return 0;
  }

  if (key === 'ArrowDown') {
    return (currentIndex + 1) % optionCount;
  }

  if (key === 'ArrowUp') {
    return (currentIndex - 1 + optionCount) % optionCount;
  }

  if (key === 'Home') {
    return 0;
  }

  return optionCount - 1;
};
