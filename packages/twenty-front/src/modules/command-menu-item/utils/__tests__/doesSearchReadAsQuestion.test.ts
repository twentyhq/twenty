import { doesSearchReadAsQuestion } from '@/command-menu-item/utils/doesSearchReadAsQuestion';

describe('doesSearchReadAsQuestion', () => {
  it('reads a search ending with a question mark as a question', () => {
    expect(doesSearchReadAsQuestion('deals?')).toBe(true);
  });

  it('reads a search starting with a starter word as a question', () => {
    expect(doesSearchReadAsQuestion('Summarize apple')).toBe(true);
    expect(doesSearchReadAsQuestion("what's new")).toBe(true);
  });

  it('does not take a word that only begins like a starter word', () => {
    expect(doesSearchReadAsQuestion('isabel')).toBe(false);
  });

  it('reads a search of four words or more as a question', () => {
    expect(doesSearchReadAsQuestion('apple deals closing soon')).toBe(true);
    expect(doesSearchReadAsQuestion('apple deals closing')).toBe(false);
  });

  it('does not read a short keyword or a blank search as a question', () => {
    expect(doesSearchReadAsQuestion('pe')).toBe(false);
    expect(doesSearchReadAsQuestion('   ')).toBe(false);
  });

  it('ignores surrounding whitespace', () => {
    expect(doesSearchReadAsQuestion('  deals?  ')).toBe(true);
  });
});
