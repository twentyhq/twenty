import { describe, expect, it } from 'vitest';

import { collectSlackSharedFileNames } from 'src/logic-functions/utils/collect-slack-shared-file-names';

describe('collectSlackSharedFileNames', () => {
  it('should collect file names across messages without duplicates', () => {
    const fileNames = collectSlackSharedFileNames([
      { ts: '1', user: 'U123', files: [{ id: 'F1', name: 'proposal.pdf' }] },
      { ts: '2', user: 'U123', text: 'no file here' },
      {
        ts: '3',
        user: 'U123',
        files: [
          { id: 'F1', name: 'proposal.pdf' },
          { id: 'F2', name: 'chart.png' },
        ],
      },
    ]);

    expect(fileNames).toEqual(['proposal.pdf', 'chart.png']);
  });

  it('should return no names when nothing was shared', () => {
    expect(
      collectSlackSharedFileNames([{ ts: '1', user: 'U123', text: 'hello' }]),
    ).toEqual([]);
  });
});
