import { SDK_CLIENT_IMPORT_SPECIFIERS } from '@/constants/SdkClientImportSpecifiers';
import { buildModuleImportContextPattern } from '@/utils/buildModuleImportContextPattern';

export const containsSdkClientImportSpecifier = (source: string): boolean =>
  SDK_CLIENT_IMPORT_SPECIFIERS.some((specifier) =>
    buildModuleImportContextPattern(specifier).test(source),
  );
