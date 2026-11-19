import { getCommandMenuItemShortcut } from '@/command-menu/utils/getCommandMenuItemShortcut';

describe('getCommandMenuItemShortcut', () => {
  it('shows a single key on its own', () => {
    expect(getCommandMenuItemShortcut(['E'])).toEqual([['E']]);
  });

  it('shows a key sequence as successive steps', () => {
    expect(getCommandMenuItemShortcut(['G', 'S'])).toEqual([['G'], ['S']]);
  });

  it('presses a modifier together with the key after it', () => {
    expect(getCommandMenuItemShortcut(['Mod', 'A'])).toEqual([['Mod', 'A']]);
  });

  it('keeps stacked modifiers in one step', () => {
    expect(getCommandMenuItemShortcut(['Mod', 'Shift', 'A'])).toEqual([
      ['Mod', 'Shift', 'A'],
    ]);
  });
});
