import { openAsBlob } from 'node:fs';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { readSnapshotFile } from '@/app/deployment/read-snapshot-file';
import { hashContent } from '@/utils/hash-content';

vi.mock('node:fs', { spy: true });

describe('snapshot upload contents', () => {
  it('reports a file changing during verification as an invalid snapshot', async () => {
    const blob = new Blob(['content']);
    vi.spyOn(blob, 'stream').mockReturnValue(
      new ReadableStream({
        pull(controller) {
          controller.error(
            new DOMException('The blob could not be read', 'NotReadableError'),
          );
        },
      }),
    );
    vi.mocked(openAsBlob).mockResolvedValueOnce(blob);
    await expect(
      readSnapshotFile({
        snapshotDirectory: tmpdir(),
        artifact: {
          path: 'function.mjs',
          size: 7,
          sha256: hashContent('content'),
          role: 'logic-function',
          sourcePath: 'function.ts',
        },
      }),
    ).rejects.toMatchObject({
      code: 'SNAPSHOT_INVALID',
      hint: expect.stringContaining('Build again'),
    });
  });
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
