import { AppPath } from 'twenty-shared/types';
import indexAppPath from '@/modules/navigation/utils/indexAppPath';

describe('getIndexAppPath', () => {
  it('returns the index app path', () => {
    const { getIndexAppPath } = indexAppPath;
    expect(getIndexAppPath()).toEqual(AppPath.Index);
  });
});
