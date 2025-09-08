import { AppPath } from '@/types/AppPath';
import indexAppPath from '../indexAppPath';

describe('getIndexAppPath', () => {
  it('returns the index app path', () => {
    const { getIndexAppPath } = indexAppPath;
    expect(getIndexAppPath()).toEqual(AppPath.Index);
  });
});
