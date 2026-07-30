import { beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();
const enqueueSnackbar = vi.fn();
const updateProgress = vi.fn();

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    post = post;
  },
}));

vi.mock('twenty-sdk/front-component', () => ({
  Command: () => null,
  enqueueSnackbar,
  updateProgress,
  useSelectedRecordIds: () => [],
}));

const { recomputeSelectedRecords } = await import(
  'src/front-components/utils/create-recompute-effect'
);
const { RECOMPUTE_TARGETS } = await import('src/types/recompute-target');

const buildRecordIds = (count: number): string[] =>
  Array.from({ length: count }, (_unused, index) => `record-${index}`);

describe('recomputeSelectedRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a single batch for a small selection', async () => {
    await recomputeSelectedRecords({
      target: RECOMPUTE_TARGETS.company,
      recordIds: ['company-1', 'company-2'],
    });

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      '/s/last-contact/recompute-last-contact',
      {
        objectNameSingular: 'company',
        recordIds: ['company-1', 'company-2'],
      },
    );
    expect(enqueueSnackbar).toHaveBeenCalledWith({
      message: 'Recomputed last contact for 2 companies.',
      variant: 'success',
    });
  });

  it('should split a large selection into batches of 20', async () => {
    await recomputeSelectedRecords({
      target: RECOMPUTE_TARGETS.person,
      recordIds: buildRecordIds(45),
    });

    expect(post).toHaveBeenCalledTimes(3);
    expect(
      post.mock.calls.map((call) => call[1].recordIds.length),
    ).toEqual([20, 20, 5]);
    expect(updateProgress.mock.calls.map((call) => call[0])).toEqual([
      1 / 3,
      2 / 3,
      1,
    ]);
    expect(enqueueSnackbar).toHaveBeenCalledTimes(1);
  });

  it('should use the singular label for a single record', async () => {
    await recomputeSelectedRecords({
      target: RECOMPUTE_TARGETS.opportunity,
      recordIds: ['opportunity-1'],
    });

    expect(enqueueSnackbar).toHaveBeenCalledWith({
      message: 'Recomputed last contact for 1 opportunity.',
      variant: 'success',
    });
  });

  it('should not call the route when nothing is selected', async () => {
    await recomputeSelectedRecords({
      target: RECOMPUTE_TARGETS.person,
      recordIds: [],
    });

    expect(post).not.toHaveBeenCalled();
    expect(enqueueSnackbar).toHaveBeenCalledWith({
      message: 'Select at least one person to recompute.',
      variant: 'info',
    });
  });

  it('should report an error and stop when a batch fails', async () => {
    post.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('429'));

    await recomputeSelectedRecords({
      target: RECOMPUTE_TARGETS.person,
      recordIds: buildRecordIds(45),
    });

    expect(post).toHaveBeenCalledTimes(2);
    expect(enqueueSnackbar).toHaveBeenCalledWith({
      message: 'Last contact recompute failed',
      variant: 'error',
    });
  });
});
