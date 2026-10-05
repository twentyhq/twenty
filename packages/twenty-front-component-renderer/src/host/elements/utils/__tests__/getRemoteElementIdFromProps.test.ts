import { REMOTE_ELEMENT_PROP } from '@remote-dom/react/host';

import { getRemoteElementIdFromProps } from '../getRemoteElementIdFromProps';

describe('getRemoteElementIdFromProps', () => {
  it('should read the id from the remote element symbol prop', () => {
    expect(
      getRemoteElementIdFromProps({ [REMOTE_ELEMENT_PROP]: { id: '42' } }),
    ).toBe('42');
  });

  it('should return undefined when the symbol prop is absent', () => {
    expect(getRemoteElementIdFromProps({})).toBeUndefined();
  });

  it('should return undefined when the id is not a string', () => {
    expect(
      getRemoteElementIdFromProps({ [REMOTE_ELEMENT_PROP]: { id: 42 } }),
    ).toBeUndefined();
  });

  it('should ignore a string keyed element prop supplied by a guest', () => {
    expect(getRemoteElementIdFromProps({ element: { id: 'spoofed' } })).toBe(
      undefined,
    );
  });
});
