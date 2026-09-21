import { buildModuleImportContextPattern } from '@/utils/module-imports/buildModuleImportContextPattern';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';

export const containsSharedDependenciesImportSpecifier = (
  source: string,
): boolean =>
  buildModuleImportContextPattern(
    FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
  ).test(source);
