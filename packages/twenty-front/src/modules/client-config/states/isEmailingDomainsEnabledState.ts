import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isEmailingDomainsEnabledState = createState<boolean>({
  key: 'isEmailingDomainsEnabled',
  defaultValue: false,
});
