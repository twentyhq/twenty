import { type SharedDependenciesExportNames } from '@/front-component-renderer/build/shared-dependencies-build/types/shared-dependencies-export-names.type';

export type SharedDependenciesBuildContext = {
  exportNamesBySpecifier: Map<string, SharedDependenciesExportNames>;
};
