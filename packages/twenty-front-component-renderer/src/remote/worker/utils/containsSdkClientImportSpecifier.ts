import { SDK_CLIENT_IMPORT_SPECIFIERS } from '@/remote/worker/constants/SdkClientImportSpecifiers';

export const containsSdkClientImportSpecifier = (source: string): boolean =>
  SDK_CLIENT_IMPORT_SPECIFIERS.some((specifier) => source.includes(specifier));
