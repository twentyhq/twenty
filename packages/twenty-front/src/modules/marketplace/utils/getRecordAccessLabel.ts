import { type RecordAccess } from '@/marketplace/types/RecordAccess';
import { t } from '@lingui/core/macro';

export const getRecordAccessLabel = ({
  access: { canRead, canWrite, canDelete },
  target,
}: {
  access: RecordAccess;
  target: string;
}): string | undefined => {
  if (canRead && canWrite && canDelete) {
    return t`Read, write, and delete ${target}`;
  }

  if (canRead && canWrite) {
    return t`Read and write ${target}`;
  }

  if (canRead && canDelete) {
    return t`Read and delete ${target}`;
  }

  if (canWrite && canDelete) {
    return t`Write and delete ${target}`;
  }

  if (canRead) {
    return t`Read ${target}`;
  }

  if (canWrite) {
    return t`Write ${target}`;
  }

  if (canDelete) {
    return t`Delete ${target}`;
  }

  return undefined;
};
