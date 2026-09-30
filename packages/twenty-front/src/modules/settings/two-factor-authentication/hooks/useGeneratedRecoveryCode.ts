import { useState } from 'react';

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
      new Date(recoveryCodeToShow.expiresAt).getTime() - Date.now(),
    );
  };

  const clearGeneratedRecoveryCode = () => setGeneratedRecoveryCode(null);

  return {
    generatedRecoveryCode,
    showGeneratedRecoveryCode,
    clearGeneratedRecoveryCode,
  };
};
