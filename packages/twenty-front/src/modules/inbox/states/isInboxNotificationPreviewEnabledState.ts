import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isInboxNotificationPreviewEnabledState = createAtomState<boolean>({
  key: 'isInboxNotificationPreviewEnabledState',
  defaultValue: true,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
