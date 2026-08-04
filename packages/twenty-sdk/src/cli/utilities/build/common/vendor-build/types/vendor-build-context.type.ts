import { type VendorExportNames } from '@/cli/utilities/build/common/vendor-build/types/vendor-export-names.type';

export type VendorBuildContext = {
  exportNamesBySpecifier: Map<string, VendorExportNames>;
};
