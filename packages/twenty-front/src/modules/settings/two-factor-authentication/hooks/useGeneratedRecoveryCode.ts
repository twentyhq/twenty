import { useState } from 'react';

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
