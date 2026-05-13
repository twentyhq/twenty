// Server-side return-to-path validator.
// Used to reject open-redirect attempts when forwarding the original deep link
// (typically /authorize?...) back to the frontend after a social SSO callback.
//
// Mirrors the client-side check in
// packages/twenty-front/src/modules/auth/utils/isValidReturnToPath.ts but
// intentionally only enforces the structural rules that the server can reason
// about without depending on frontend route constants. The frontend applies a
// stricter check (excludes onboarding/auth paths) before navigating.
export const isValidReturnToPath = (path: unknown): path is string => {
  if (typeof path !== 'string' || path.length === 0 || path === '/') {
    return false;
  }

  if (!path.startsWith('/') || path.startsWith('//')) {
    return false;
  }

  return true;
};
