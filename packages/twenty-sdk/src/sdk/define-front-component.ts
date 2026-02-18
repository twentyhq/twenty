import { createValidationResult } from '@/sdk';
import type { DefineEntity } from '@/sdk/common/types/define-entity.type';
import { type FrontComponentConfig } from '@/sdk/front-component-config';

const VALID_FRAMEWORKS = ['react', 'vue', 'svelte', 'angular'] as const;

export const defineFrontComponent: DefineEntity<FrontComponentConfig> = (
  config,
) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Front component must have a universalIdentifier');
  }

  if (!config.component) {
    errors.push('Front component must have a component');
  }

  const framework = config.framework ?? 'react';

  if (!VALID_FRAMEWORKS.includes(framework)) {
    errors.push(
      `Front component framework must be one of: ${VALID_FRAMEWORKS.join(', ')}`,
    );
  }

  if (framework === 'react' && typeof config.component !== 'function') {
    errors.push('React front component must be a function component');
  }

  if (
    framework !== 'react' &&
    typeof config.component !== 'function'
  ) {
    errors.push(
      'Non-React front component must be a render function (container: HTMLElement) => void',
    );
  }

  return createValidationResult({
    config,
    errors,
  });
};
