import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type DefineAbsentGlobalScopeValuesInput = {
  globalScope: Record<string, unknown>;
  values: Record<string, unknown>;
};

// A native always beats the value this package would install, and the check
// walks the prototype chain on purpose: the worker's own natives live on
// WorkerGlobalScope.prototype, not as own properties.
export const defineAbsentGlobalScopeValues = ({
  globalScope,
  values,
}: DefineAbsentGlobalScopeValuesInput): void => {
  const valueEntries = Object.entries(values);

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    for (const [valueName, value] of valueEntries) {
      if (valueName in installTarget) {
        continue;
      }

      installTarget[valueName] = value;
    }
  }
};
