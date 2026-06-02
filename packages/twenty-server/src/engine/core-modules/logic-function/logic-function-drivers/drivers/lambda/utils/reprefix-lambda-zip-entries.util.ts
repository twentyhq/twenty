// Re-wraps zip entries under a new prefix path without extracting to disk.
export const reprefixLambdaZipEntries = async ({
  sourceBuffer,
  prefix,
}: {
  sourceBuffer: Buffer;
  prefix: string;
}): Promise<Buffer> => {
  const { default: unzipper } = await import('unzipper');
  const archiver = (await import('archiver')).default;

  const directory = await unzipper.Open.buffer(sourceBuffer);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const chunks: Buffer[] = [];

  archive.on('data', (chunk: Buffer) => chunks.push(chunk));

  for (const entry of directory.files) {
    if (entry.type === 'Directory') {
      continue;
    }

    archive.append(entry.stream(), {
      name: `${prefix}/${entry.path}`,
    });
  }

  await new Promise<void>((resolve, reject) => {
    archive.on('end', resolve);
    archive.on('error', reject);
    void archive.finalize();
  });

  return Buffer.concat(chunks);
};
