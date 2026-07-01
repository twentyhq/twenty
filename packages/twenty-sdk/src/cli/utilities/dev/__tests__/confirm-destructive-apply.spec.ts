import inquirer from 'inquirer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmDestructiveApply } from '@/cli/utilities/dev/confirm-destructive-apply';

vi.mock('inquirer', () => ({
  default: { prompt: vi.fn() },
}));

const mockedPrompt = vi.mocked(inquirer.prompt);

const setIsTTY = (value: boolean): void => {
  Object.defineProperty(process.stdout, 'isTTY', {
    value,
    configurable: true,
  });
};

const originalIsTTY = process.stdout.isTTY;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  setIsTTY(originalIsTTY as boolean);
  vi.restoreAllMocks();
  mockedPrompt.mockReset();
});

describe('confirmDestructiveApply', () => {
  it('should return true without prompting when force is set', async () => {
    const result = await confirmDestructiveApply(3, { force: true });

    expect(result).toBe(true);
    expect(mockedPrompt).not.toHaveBeenCalled();
  });

  it('should fail closed without prompting when not a TTY', async () => {
    setIsTTY(false);

    const result = await confirmDestructiveApply(2, { force: false });

    expect(result).toBe(false);
    expect(mockedPrompt).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should return true when the user confirms in a TTY', async () => {
    setIsTTY(true);
    mockedPrompt.mockResolvedValue({ confirmed: true });

    const result = await confirmDestructiveApply(1, { force: false });

    expect(result).toBe(true);
    expect(mockedPrompt).toHaveBeenCalledTimes(1);
  });

  it('should return false when the user declines in a TTY', async () => {
    setIsTTY(true);
    mockedPrompt.mockResolvedValue({ confirmed: false });

    const result = await confirmDestructiveApply(1, { force: false });

    expect(result).toBe(false);
  });
});
