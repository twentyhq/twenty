export {
  createDevBuildConfig,
  EXTERNAL_MODULES,
  type DevBuildConfigOptions,
} from './build-config';

export {
  extractFunctionEntryPoints,
  haveFunctionEntryPointsChanged,
} from './entry-points';

export {
  buildFunctionInput,
  computeFunctionOutputPath,
} from './function-paths';

export {
  createManifestPlugin,
  runManifestBuild,
  type ManifestPluginCallbacks,
  type ManifestPluginState,
} from './manifest-plugin';
