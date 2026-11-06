export const readStreamWithinSizeLimit = async ({
  stream,
  maxSizeBytes,
}: {
  stream: ReadableStream<Uint8Array>;
  maxSizeBytes: number;
}): Promise<Buffer> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let sizeBytes = 0;
  let readResult = await reader.read();

  while (!readResult.done) {
    sizeBytes += readResult.value.byteLength;

    if (sizeBytes > maxSizeBytes) {
      await reader.cancel();

      throw new Error(`Attachment is larger than ${maxSizeBytes} bytes`);
    }

    chunks.push(readResult.value);
    readResult = await reader.read();
  }

  return Buffer.concat(chunks);
};
