import { buildModuleImportContextPattern } from '@/utils/buildModuleImportContextPattern';
import { SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';

export const containsSharedDependenciesImportSpecifier = (
  source: string,
): boolean =>
  buildModuleImportContextPattern(SHARED_DEPENDENCIES_IMPORT_SPECIFIER).test(
    source,
  );
