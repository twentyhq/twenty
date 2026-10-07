import { hashContent } from '@/utils/hash-content';
import { type PullDeletion, type PullWrite } from '@/app/pull/plan-pull-writes';

export const updateSourceFingerprints = ({
  sourceFingerprints = {},
  writes,
  deletions,
}: {
  sourceFingerprints?: Record<string, string>;
  writes: Pick<PullWrite, 'relativePath' | 'content'>[];
  deletions: PullDeletion[];
}): Record<string, string> => {
  const deletedRelativePaths = new Set(
    deletions.map((deletion) => deletion.relativePath),
  );

  return {
    ...Object.fromEntries(
      Object.entries(sourceFingerprints).filter(
        ([relativePath]) => !deletedRelativePaths.has(relativePath),
      ),
    ),
    ...Object.fromEntries(
      writes.map((write) => [write.relativePath, hashContent(write.content)]),
    ),
  };
};
