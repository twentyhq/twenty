import { useAppFocusOnMountOnly } from '../hooks/useAppFocusOnMountOnly';
import { AppFocus } from '../types/AppFocus';

export function AppFocusOnMountOnly({ appFocus }: { appFocus: AppFocus }) {
  useAppFocusOnMountOnly(appFocus);

  return <></>;
}
