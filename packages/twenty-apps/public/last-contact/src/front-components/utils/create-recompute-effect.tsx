import { RestApiClient } from 'twenty-client-sdk/rest';
import {
  Command,
  enqueueSnackbar,
  updateProgress,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

import { RECOMPUTE_BATCH_SIZE } from 'src/constants/recompute-batch-size';
import { RECOMPUTE_LOGIC_FUNCTION } from 'src/constants/universal-identifiers';
import {
  type RecomputeTarget,
  type RecomputeTargetName,
} from 'src/types/recompute-target';
import { chunk } from 'src/utils/last-contact/chunk';

const LABEL_BY_TARGET: Record<
  RecomputeTargetName,
  { one: string; many: string }
> = {
  person: { one: 'person', many: 'people' },
  company: { one: 'company', many: 'companies' },
  opportunity: { one: 'opportunity', many: 'opportunities' },
};

export const recomputeSelectedRecords = async ({
  target,
  recordIds,
}: {
  target: RecomputeTarget;
  recordIds: string[];
}): Promise<void> => {
  const label = LABEL_BY_TARGET[target.objectNameSingular];

  if (recordIds.length === 0) {
    await enqueueSnackbar({
      message: `Select at least one ${label.one} to recompute.`,
      variant: 'info',
    });

    return;
  }

  const batches = chunk(recordIds, RECOMPUTE_BATCH_SIZE);

  try {
    const client = new RestApiClient();

    for (const [batchIndex, batch] of batches.entries()) {
      await client.post(`/s${RECOMPUTE_LOGIC_FUNCTION.path}`, {
        objectNameSingular: target.objectNameSingular,
        recordIds: batch,
      });

      await updateProgress((batchIndex + 1) / batches.length);
    }

    await enqueueSnackbar({
      message: `Recomputed last contact for ${recordIds.length} ${
        recordIds.length > 1 ? label.many : label.one
      }.`,
      variant: 'success',
    });
  } catch {
    await enqueueSnackbar({
      message: 'Last contact recompute failed',
      variant: 'error',
    });
  }
};

export const createRecomputeEffect = (target: RecomputeTarget) => {
  const RecomputeEffect = () => {
    const recordIds = useSelectedRecordIds();

    return (
      <Command
        execute={() => recomputeSelectedRecords({ target, recordIds })}
      />
    );
  };

  return RecomputeEffect;
};
