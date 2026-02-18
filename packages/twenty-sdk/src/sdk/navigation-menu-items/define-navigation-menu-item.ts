import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type NavigationMenuItemManifest } from 'twenty-shared/application';

export const defineNavigationMenuItem: DefineEntity<
  NavigationMenuItemManifest
> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('NavigationMenuItem must have a universalIdentifier');
  }

  if (typeof config.position !== 'number') {
    errors.push('NavigationMenuItem must have a position');
  }

  return createValidationResult({ config, errors });
};
