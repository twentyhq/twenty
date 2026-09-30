import { useState } from 'react';

// Keeps the code visible long enough to copy when the browser clock is ahead
// of the server's.
const MINIMUM_DISPLAY_DURATION_MS = 5 * 60 * 1000;

type GeneratedRecoveryCode = {
  recoveryCode: string;
  expiresAt: string;
};

export const useGeneratedRecoveryCode = () => {
  const [generatedRecoveryCode, setGeneratedRecoveryCode] =
    useState<GeneratedRecoveryCode | null>(null);

  const showGeneratedRecoveryCode = (
    recoveryCodeToShow: GeneratedRecoveryCode,
  ) => {
    setGeneratedRecoveryCode(recoveryCodeToShow);

    // An expired code can no longer be redeemed, so it is hidden instead of
    // staying copyable for an admin who left the page open.
    setTimeout(
      () =>
        setGeneratedRecoveryCode((currentRecoveryCode) =>
          currentRecoveryCode === recoveryCodeToShow
            ? null
            : currentRecoveryCode,
        ),
      Math.max(
        new Date(recoveryCodeToShow.expiresAt).getTime() - Date.now(),
        MINIMUM_DISPLAY_DURATION_MS,
      ),
    );
  };

  const clearGeneratedRecoveryCode = () => setGeneratedRecoveryCode(null);

  return {
    generatedRecoveryCode,
    showGeneratedRecoveryCode,
    clearGeneratedRecoveryCode,
  };
};
