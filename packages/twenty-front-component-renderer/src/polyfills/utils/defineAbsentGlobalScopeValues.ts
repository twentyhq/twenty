import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type DefineAbsentGlobalScopeValuesInput = {
  globalScope: Record<string, unknown>;
  values: Record<string, unknown>;
};

// A name a target already holds is left alone: the remote-dom window owns some
// of these, and a native always beats the value this package would install.
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
