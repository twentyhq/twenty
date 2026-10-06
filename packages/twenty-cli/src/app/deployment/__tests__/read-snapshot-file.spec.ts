import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readSnapshotFile } from '@/app/deployment/read-snapshot-file';
import { hashContent } from '@/utils/hash-content';

describe('snapshot upload contents', () => {
  it('returns file-backed content and refuses changed artifacts before upload', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'snapshot-stream-'));
    const content = Buffer.alloc(1024 * 1024, 'x');
    const artifact = {
      path: 'function.mjs',
      size: content.length,
      sha256: hashContent(content),
      role: 'logic-function',
      sourcePath: 'function.ts',
    };

    try {
      await writeFile(join(directory, artifact.path), content);
      const blob = await readSnapshotFile({
        snapshotDirectory: directory,
        artifact,
      });
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBe(content.length);
      expect(Buffer.from(await blob.arrayBuffer())).toEqual(content);
      await writeFile(join(directory, artifact.path), 'changed');
      await expect(
        readSnapshotFile({ snapshotDirectory: directory, artifact }),
      ).rejects.toMatchObject({ code: 'SNAPSHOT_INVALID' });
      await expect(blob.arrayBuffer()).rejects.toThrow();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
