import { getCommandMenuItemProgressLabel } from '@/command-menu-item/utils/getCommandMenuItemProgressLabel';

describe('getCommandMenuItemProgressLabel', () => {
  it.each([
    { progress: undefined, expected: 'Preparing…' },
    { progress: 0, expected: 'Preparing…' },
    { progress: 0.6, expected: '1%' },
    { progress: 42.4, expected: '42%' },
    { progress: 100, expected: '100%' },
  ])('formats $progress as $expected', ({ progress, expected }) => {
    expect(getCommandMenuItemProgressLabel(progress)).toBe(expected);
  });
});
