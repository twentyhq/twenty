import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type VendorConfig } from '@/sdk/define/vendor/vendor-config';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

const RESERVED_DEPENDENCY_PREFIXES = ['twenty-client-sdk', 'twenty-sdk'];

export const defineVendor: DefineEntity<VendorConfig> = (config) => {
  const errors = [];

  if (!isNonEmptyArray(config.dependencies)) {
    errors.push('Vendor must have at least one dependency');
  } else {
    const seenDependencies = new Set<string>();

    for (const dependency of config.dependencies) {
      if (!isNonEmptyString(dependency)) {
        errors.push('Vendor dependencies must be non-empty strings');
        continue;
      }

      if (dependency.startsWith('.') || dependency.startsWith('/')) {
        errors.push(
          `Vendor dependency "${dependency}" must be a package specifier, not a relative or absolute path`,
        );
        continue;
      }

      if (dependency === VENDOR_BUNDLE_IMPORT_SPECIFIER) {
        errors.push(
          `Vendor dependency "${dependency}" is reserved and cannot be vendored`,
        );
        continue;
      }

      if (
        RESERVED_DEPENDENCY_PREFIXES.some(
          (prefix) =>
            dependency === prefix || dependency.startsWith(`${prefix}/`),
        )
      ) {
        errors.push(
          `Vendor dependency "${dependency}" is already served separately and cannot be vendored`,
        );
        continue;
      }

      if (seenDependencies.has(dependency)) {
        errors.push(`Vendor dependency "${dependency}" is declared twice`);
        continue;
      }

      seenDependencies.add(dependency);
    }
  }

  return createValidationResult({
    config,
    errors,
  });
};
