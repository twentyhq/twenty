import { SDK_IMPORT_SPECIFIERS } from '@/remote/worker/constants/SdkImportSpecifiers';

export const containsSdkImportSpecifier = (source: string): boolean =>
  SDK_IMPORT_SPECIFIERS.some((specifier) => source.includes(specifier));
