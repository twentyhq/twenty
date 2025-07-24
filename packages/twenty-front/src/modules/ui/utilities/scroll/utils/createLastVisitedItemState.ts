import { createState } from 'twenty-ui/utilities';

export const createLastVisitedItemState = (key: string) => {
  return createState<string | null>({
    key: `lastVisited${key}State`,
    defaultValue: null,
  });
}; 