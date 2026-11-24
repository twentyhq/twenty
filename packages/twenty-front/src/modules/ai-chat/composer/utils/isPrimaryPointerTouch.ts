import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

export const isPrimaryPointerTouch = (): boolean =>
  isDefined(window.matchMedia) &&
  window.matchMedia(doNotTranslate('(pointer: coarse)')).matches;
