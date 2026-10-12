// not pending, so the execution does not pause on it and the model reads why
export const buildSecondWaitRefusalOutput = () => ({
  success: false,
  error:
    'Only one wait can be active at a time. Call a single wait tool and continue once it resolves.',
});
