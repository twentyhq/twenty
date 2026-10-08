import { describe, expect, it } from 'vitest';

import { getSlackMessageFileNames } from 'src/logic-functions/utils/get-slack-message-file-names';

describe('getSlackMessageFileNames', () => {
  it('should return no names when the message carries no files', () => {
    expect(getSlackMessageFileNames(undefined)).toEqual([]);
    expect(getSlackMessageFileNames([])).toEqual([]);
  });

  it('should prefer the file name and fall back to its title', () => {
    expect(
      getSlackMessageFileNames([
        { id: 'F1', name: 'proposal.pdf', title: 'Proposal' },
        { id: 'F2', title: 'Q3 chart' },
      ]),
    ).toEqual(['proposal.pdf', 'Q3 chart']);
  });

  it('should label a file that has neither a name nor a title', () => {
    expect(getSlackMessageFileNames([{ id: 'F1' }])).toEqual([
      'an unnamed file',
    ]);
  });

  it('should treat a blank name as missing', () => {
    expect(
      getSlackMessageFileNames([{ id: 'F1', name: '   ', title: '\n' }]),
    ).toEqual(['an unnamed file']);
  });

  it('should flatten a multi-line file name onto one line', () => {
    expect(
      getSlackMessageFileNames([{ id: 'F1', name: 'quarterly\nreport.pdf' }]),
    ).toEqual(['quarterly report.pdf']);
  });

  it('should truncate an overlong file name', () => {
    const [fileName] = getSlackMessageFileNames([
      { id: 'F1', name: `${'a'.repeat(300)}.pdf` },
    ]);

    expect(fileName).toHaveLength(101);
    expect(fileName.endsWith('…')).toBe(true);
  });
});
