import { createState } from 'twenty-ui/utilities';

type NavigationMemorizedUrl = {
  url: string;
  isAddingFieldOption?: boolean;
};

export const navigationMemorizedUrlState = createState<NavigationMemorizedUrl>({
  key: 'navigationMemorizedUrlState',
  defaultValue: { url: '/' },
});
