import { splitCommaSeparatedHandles } from 'src/engine/core-modules/tool/tools/message-composer/utils/split-comma-separated-handles.util';

describe('splitCommaSeparatedHandles', () => {
  it('splits, trims and drops empty entries', () => {
    expect(splitCommaSeparatedHandles(' 919876543210 ,, +15551675247 ')).toEqual(
      ['919876543210', '+15551675247'],
    );
  });

  it('returns an empty array for undefined or blank input', () => {
    expect(splitCommaSeparatedHandles(undefined)).toEqual([]);
    expect(splitCommaSeparatedHandles('  ')).toEqual([]);
  });
});
