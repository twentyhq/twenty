export const createAiChatCodedError = (
  message: string,
  code: string,
): Error & { code?: string } => {
  const codedError = new Error(message) as Error & { code?: string };

  codedError.code = code;

  return codedError;
};
