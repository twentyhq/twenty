export async function* readBlobChunks(blob: Blob) {
  const reader = blob.stream().getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) return;

      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
