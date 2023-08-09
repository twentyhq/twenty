import { CommandMenuHook } from './CommandMenuHook';
import { GotoHotkeysHooks } from './GotoHotkeysHooks';

export function AppInternalHooks() {
  return (
    <>
      <GotoHotkeysHooks />
      <CommandMenuHook />
    </>
  );
}
