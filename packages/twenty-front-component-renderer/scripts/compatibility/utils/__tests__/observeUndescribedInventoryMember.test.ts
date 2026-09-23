import { observeUndescribedInventoryMember } from '../observeUndescribedInventoryMember';

const SERVED_KEY = { kind: 'string', name: 'served' } as const;

describe('observeUndescribedInventoryMember', () => {
  it('reports a member that a plain read does not find as missing', () => {
    expect(
      observeUndescribedInventoryMember({
        value: {},
        id: 'object.served',
        key: SERVED_KEY,
      }),
    ).toEqual({
      id: 'object.served',
      key: SERVED_KEY,
      observation: { shape: 'missing' },
    });
  });

  it('reports a member served by a proxy trap as uninspectable', () => {
    expect(
      observeUndescribedInventoryMember({
        value: new Proxy({}, { get: () => 'served' }),
        id: 'object.served',
        key: SERVED_KEY,
      }).observation,
    ).toEqual({
      shape: 'uninspectable',
      reason: 'Served without a property descriptor (string)',
    });
  });

  it('records a throwing proxy trap as uninspectable', () => {
    expect(
      observeUndescribedInventoryMember({
        value: new Proxy(
          {},
          {
            get: () => {
              throw new Error('trap failed');
            },
          },
        ),
        id: 'object.served',
        key: SERVED_KEY,
      }).observation,
    ).toEqual({ shape: 'uninspectable', reason: 'Error: trap failed' });
  });

  it('reads well-known and registered symbols and skips unknown well-known names', () => {
    const value = new Proxy(
      {},
      {
        get: (_target, property) =>
          property === Symbol.iterator || property === Symbol.for('audit')
            ? () => []
            : undefined,
      },
    );
    expect(
      observeUndescribedInventoryMember({
        value,
        id: 'object[Symbol.iterator]',
        key: { kind: 'well-known-symbol', name: 'iterator' },
      }).observation.shape,
    ).toBe('uninspectable');
    expect(
      observeUndescribedInventoryMember({
        value,
        id: 'object[Symbol.for("audit")]',
        key: { kind: 'registered-symbol', name: 'audit' },
      }).observation.shape,
    ).toBe('uninspectable');
    expect(
      observeUndescribedInventoryMember({
        value,
        id: 'object[Symbol.unknownName]',
        key: { kind: 'well-known-symbol', name: 'unknownName' },
      }).observation,
    ).toEqual({ shape: 'missing' });
  });
});
