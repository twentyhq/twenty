import { type SharedDependenciesExportNames } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/types/shared-dependencies-export-names.type';

export type SharedDependenciesBuildContext = {
  exportNamesBySpecifier: Map<string, SharedDependenciesExportNames>;
};
