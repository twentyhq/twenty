import { type SharedDependenciesExportNames } from '@/app/bundles/front-component-build/shared-dependencies-build/types/shared-dependencies-export-names.type';

export type SharedDependenciesBuildContext = {
  exportNamesBySpecifier: Map<string, SharedDependenciesExportNames>;
};
