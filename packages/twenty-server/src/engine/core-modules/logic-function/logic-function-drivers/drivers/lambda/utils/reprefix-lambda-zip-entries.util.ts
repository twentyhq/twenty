// Re-wraps zip entries under a new prefix path without extracting to disk.
// entryReplacements swaps the content of matching entries (keyed by their
// original path) so an app-agnostic module can be refreshed at publish time.
export const reprefixLambdaZipEntries = async ({
  sourceBuffer,
  prefix,
  entryReplacements = {},
}: {
  sourceBuffer: Buffer;
  prefix: string;
  entryReplacements?: Record<string, Buffer>;
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

    const normalizedPath = entry.path.replace(/^\.\//, '');
    const replacement = entryReplacements[normalizedPath];

    archive.append(replacement ?? entry.stream(), {
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
