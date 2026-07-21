import { SDK_CLIENT_IMPORT_SPECIFIERS } from '@/constants/SdkClientImportSpecifiers';
import { buildSdkClientImportContextPattern } from '@/utils/buildSdkClientImportContextPattern';

export const containsSdkClientImportSpecifier = (source: string): boolean =>
  SDK_CLIENT_IMPORT_SPECIFIERS.some((specifier) =>
    buildSdkClientImportContextPattern(specifier).test(source),
  );
