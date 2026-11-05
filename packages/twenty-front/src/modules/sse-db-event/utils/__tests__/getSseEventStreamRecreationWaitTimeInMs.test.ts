import { getSseEventStreamRecreationWaitTimeInMs } from '@/sse-db-event/utils/getSseEventStreamRecreationWaitTimeInMs';

describe('getSseEventStreamRecreationWaitTimeInMs', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not wait when the previous stream was healthy', () => {
    expect(getSseEventStreamRecreationWaitTimeInMs(0)).toBe(0);
  });

  it('should double the wait for each consecutive short-lived stream', () => {
    jest.spyOn(Math, 'random').mockReturnValue(1);

    expect(getSseEventStreamRecreationWaitTimeInMs(1)).toBe(1_000);
    expect(getSseEventStreamRecreationWaitTimeInMs(2)).toBe(2_000);
    expect(getSseEventStreamRecreationWaitTimeInMs(3)).toBe(4_000);
  });

  it('should cap the wait at two minutes', () => {
    jest.spyOn(Math, 'random').mockReturnValue(1);

    expect(getSseEventStreamRecreationWaitTimeInMs(50)).toBe(120_000);
  });

  it('should spread the wait over its upper half', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);

    expect(getSseEventStreamRecreationWaitTimeInMs(3)).toBe(2_000);
  });
});
