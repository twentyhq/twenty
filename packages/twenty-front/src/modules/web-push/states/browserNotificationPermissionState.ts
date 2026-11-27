import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { getBrowserNotificationPermission } from '@/web-push/utils/getBrowserNotificationPermission';

export const browserNotificationPermissionState = createAtomState<
  ReturnType<typeof getBrowserNotificationPermission>
>({
  key: 'browserNotificationPermissionState',
  defaultValue: getBrowserNotificationPermission(),
});
