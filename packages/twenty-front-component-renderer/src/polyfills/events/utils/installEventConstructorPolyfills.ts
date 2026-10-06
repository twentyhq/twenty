import { createEventClassByName } from '@/polyfills/events/utils/createEventClassByName';
import { resolveBaseEventClass } from '@/polyfills/events/utils/resolveBaseEventClass';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type InstallEventConstructorPolyfillsInput = {
  globalScope: Record<string, unknown>;
};

export const installEventConstructorPolyfills = ({
  globalScope,
}: InstallEventConstructorPolyfillsInput): void => {
  const eventClassByName = createEventClassByName(
    resolveBaseEventClass(globalScope),
  );

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    for (const [eventClassName, eventClass] of Object.entries(
      eventClassByName,
    )) {
      if (eventClassName in installTarget) {
        continue;
      }

      Object.defineProperty(installTarget, eventClassName, {
        value: eventClass,
        configurable: true,
        writable: true,
      });
    }
  }
};
