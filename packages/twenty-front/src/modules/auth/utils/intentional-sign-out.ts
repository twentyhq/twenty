const INTENTIONAL_SIGN_OUT_STORAGE_KEY = 'dos-id-intentional-sign-out';

// clearSession() wipes sessionStorage, so the flag must be written after it
// (sessionStorage survives the same-origin location.assign to the sign-in
// page that follows). While the flag is set the welcome page suppresses the
// DOS ID auto-redirect and shows a signed-out notice instead - without it a
// deliberate sign out bounces straight back through the identity provider
// and reads as a no-op. The flag dies with the tab or is cleared on sign-in.
export const markIntentionalSignOut = (): void => {
  sessionStorage.setItem(INTENTIONAL_SIGN_OUT_STORAGE_KEY, String(Date.now()));
};

export const hasIntentionalSignOutFlag = (): boolean =>
  sessionStorage.getItem(INTENTIONAL_SIGN_OUT_STORAGE_KEY) !== null;

export const clearIntentionalSignOutFlag = (): void => {
  sessionStorage.removeItem(INTENTIONAL_SIGN_OUT_STORAGE_KEY);
};
