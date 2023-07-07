import { useAppFocusDuringMount } from '../hooks/useAppFocusDuringMount';
import { AppFocus } from '../types/AppFocus';

export function AppFocusDuringMount({ appFocus }: { appFocus: AppFocus }) {
  useAppFocusDuringMount(appFocus);

  return <></>;
}
