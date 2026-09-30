// Excel saves CSV in the system code page, usually Windows-1252, so anything
// that is not valid UTF-8 is read as Windows-1252 rather than garbled.
export const detectRecordImportTextEncoding = (prefix: Buffer): string => {
  if (prefix[0] === 0xff && prefix[1] === 0xfe) {
    return 'utf-16le';
  }

  if (prefix[0] === 0xfe && prefix[1] === 0xff) {
    return 'utf-16be';
  }

  try {
    // stream: true tolerates a multi-byte character cut by the prefix end
    new TextDecoder('utf-8', { fatal: true }).decode(prefix, { stream: true });

    return 'utf-8';
  } catch {
    return 'windows-1252';
  }
};
