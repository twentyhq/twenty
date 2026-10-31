import { isNonEmptyString } from '@sniptt/guards';

export const getAgentIcon = (icon: string | null | undefined): string =>
  isNonEmptyString(icon) ? icon : 'IconLego';
