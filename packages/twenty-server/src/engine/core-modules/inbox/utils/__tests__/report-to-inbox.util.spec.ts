import { type Logger } from '@nestjs/common';

import { reportToInbox } from 'src/engine/core-modules/inbox/utils/report-to-inbox.util';

describe('reportToInbox', () => {
  const logger = { warn: jest.fn() } as unknown as Logger;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run the report and stay quiet when it succeeds', async () => {
    // Prepare
    const report = jest.fn().mockResolvedValue(undefined);

    // Act
    await reportToInbox(logger, 'a completed turn', report);

    // Assert
    expect(report).toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  // The whole point: the caller already did its work, so a failure here is
  // reported and dropped rather than surfaced as the caller failing
  it('should swallow the failure and say what could not be updated', async () => {
    // Prepare
    const report = jest.fn().mockRejectedValue(new Error('routing is down'));

    // Act
    await expect(
      reportToInbox(logger, 'a completed turn', report),
    ).resolves.toBeUndefined();

    // Assert
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('a completed turn'),
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('routing is down'),
    );
  });

  it('should report a thrown non error without losing it', async () => {
    // Prepare
    const report = jest.fn().mockRejectedValue('a bare string');

    // Act
    await reportToInbox(logger, 'a removed thread', report);

    // Assert
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('a bare string'),
    );
  });
});
