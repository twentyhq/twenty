import { isDefined } from 'twenty-shared/utils';

export const isFrontComponentPortalOwnerInert = (
  rootContainer: Element,
): boolean =>
  getComputedStyle(rootContainer).pointerEvents === 'none' ||
  isDefined(rootContainer.closest('[inert]'));
