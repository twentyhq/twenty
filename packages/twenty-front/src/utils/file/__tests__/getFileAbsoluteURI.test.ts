import { getFileAbsoluteURI } from '../getFileAbsoluteURI';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

describe('getFileAbsoluteURI', () => {
  test('should return absolute uri', () => {
    expect(getFileAbsoluteURI('foo')).toEqual(
      `${REACT_APP_SERVER_BASE_URL}/files/foo`,
    );
  });
});
