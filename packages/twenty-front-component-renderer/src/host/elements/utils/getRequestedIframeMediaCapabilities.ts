import { isNonEmptyString } from '@sniptt/guards';
import { MEDIA_CAPABILITIES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const getRequestedIframeMediaCapabilities = (allow?: string) => {
  const directives = (allow ?? '')
    .split(';')
    .map((directive) =>
      directive.trim().toLowerCase().split(/\s+/).filter(isNonEmptyString),
    );

  return MEDIA_CAPABILITIES.filter((capability) => {
    const directive = directives.find(([feature]) => feature === capability);

    return isDefined(directive) && !directive.includes("'none'");
  });
};
