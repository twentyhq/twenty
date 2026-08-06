import { buildModuleImportContextPattern } from '@/utils/buildModuleImportContextPattern';
import { VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

export const containsVendorImportSpecifier = (source: string): boolean =>
  buildModuleImportContextPattern(VENDOR_BUNDLE_IMPORT_SPECIFIER).test(source);
