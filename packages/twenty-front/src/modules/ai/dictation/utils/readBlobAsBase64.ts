// FileReader rather than arrayBuffer + manual encoding: building a base64
// string from a large byte array in JavaScript blocks the main thread, and the
// browser's own encoder does it off-thread.
export const readBlobAsBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(reader.error ?? new Error('Could not read the recording'));
    };

    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };

    reader.readAsDataURL(blob);
  });
