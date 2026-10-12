import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { collectOptionsOfSelect } from '@/polyfills/selectors/utils/collectOptionsOfSelect';

export const applySelectedOptionIndexes = ({
  element,
  selectedOptionIndexes,
}: {
  element: SelectorElementLike;
  selectedOptionIndexes: number[];
}): void => {
  const selectedOptionIndexSet = new Set(selectedOptionIndexes);

  for (const [optionIndex, option] of collectOptionsOfSelect(
    element,
  ).entries()) {
    option.selected = selectedOptionIndexSet.has(optionIndex);
  }
};
