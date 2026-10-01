import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const MINIMUM_DISPLAY_DURATION_MS = 5 * 60 * 1000;

type GeneratedRecoveryCode = {
  recoveryCode: string;
  expiresAt: string;
};

export const useGeneratedRecoveryCode = () => {
  const [generatedRecoveryCode, setGeneratedRecoveryCode] =
    useState<GeneratedRecoveryCode | null>(null);

  useEffect(() => {
    if (!isDefined(generatedRecoveryCode)) {
      return;
    }

    const hideTimeoutId = setTimeout(
      () => setGeneratedRecoveryCode(null),
      Math.max(
        new Date(generatedRecoveryCode.expiresAt).getTime() - Date.now(),
        MINIMUM_DISPLAY_DURATION_MS,
      ),
    );

    return () => clearTimeout(hideTimeoutId);
  }, [generatedRecoveryCode]);

  const showGeneratedRecoveryCode = (
    recoveryCodeToShow: GeneratedRecoveryCode,
  ) => setGeneratedRecoveryCode(recoveryCodeToShow);

  const clearGeneratedRecoveryCode = () => setGeneratedRecoveryCode(null);

  return {
    generatedRecoveryCode,
    showGeneratedRecoveryCode,
    clearGeneratedRecoveryCode,
  };
};
