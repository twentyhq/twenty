import { useCallback, useState } from 'react';

type GeneratedRecoveryCode = {
  recoveryCode: string;
  expiresAt: string;
};

export const useGeneratedRecoveryCode = () => {
  const [generatedRecoveryCode, setGeneratedRecoveryCode] =
    useState<GeneratedRecoveryCode | null>(null);

  const showGeneratedRecoveryCode = (
    recoveryCodeToShow: GeneratedRecoveryCode,
  ) => setGeneratedRecoveryCode(recoveryCodeToShow);

  const clearGeneratedRecoveryCode = useCallback(
    () => setGeneratedRecoveryCode(null),
    [],
  );

  return {
    generatedRecoveryCode,
    showGeneratedRecoveryCode,
    clearGeneratedRecoveryCode,
  };
};
