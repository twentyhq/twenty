export const createReadOnlyFrontComponentSandboxDocument = (
  sandboxDocument: string,
): string => {
  if (!sandboxDocument.includes('<head>')) {
    throw new Error('Cannot secure the read-only component sandbox.');
  }

  return sandboxDocument.replace(
    '<head>',
    `<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; worker-src blob:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'">`,
  );
};
