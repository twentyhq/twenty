import { isString } from '@sniptt/guards';

export const isFileInputType = (type: unknown): boolean =>
  isString(type) && type.toLowerCase() === 'file';
