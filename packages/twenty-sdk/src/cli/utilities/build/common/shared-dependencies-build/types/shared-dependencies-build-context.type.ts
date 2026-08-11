import { type SharedDependenciesExportNames } from '@/cli/utilities/build/common/shared-dependencies-build/types/shared-dependencies-export-names.type';

export type SharedDependenciesBuildContext = {
  exportNamesBySpecifier: Map<string, SharedDependenciesExportNames>;
};
