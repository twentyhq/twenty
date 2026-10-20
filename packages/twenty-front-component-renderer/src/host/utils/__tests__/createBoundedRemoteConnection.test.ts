import { type RemoteConnection } from '@remote-dom/core/elements';

import { createBoundedRemoteConnection } from '../createBoundedRemoteConnection';

describe('bounded component rendering', () => {
  let now = 0;

  beforeEach(() => {
    now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => jest.restoreAllMocks());

  it('forwards normal updates and stops permanently when output exceeds its limit', () => {
    const connection = { mutate: jest.fn(), call: jest.fn() };
    const onLimitReached = jest.fn();
    const bounded = createBoundedRemoteConnection(connection, onLimitReached);
    const normal: Parameters<RemoteConnection['mutate']>[0] = [
      [2, 'text', 'Acme'],
    ];

    bounded.mutate(normal);
    expect(connection.mutate).toHaveBeenCalledWith(normal);
    bounded.mutate([[2, 'text', 'x'.repeat(1000001)]]);
    bounded.mutate(normal);
    bounded.call('input', 'focus');
    expect(onLimitReached).toHaveBeenCalledTimes(1);
    expect(connection.mutate).toHaveBeenCalledTimes(1);
    expect(connection.call).not.toHaveBeenCalled();
  });

  it('bounds deeply nested payloads without recursive traversal', () => {
    const connection = { mutate: jest.fn(), call: jest.fn() };
    const onLimitReached = jest.fn();
    const bounded = createBoundedRemoteConnection(connection, onLimitReached);
    let value: unknown = {};
    for (let index = 0; index < 100001; index += 1) {
      value = { child: value };
    }
    bounded.mutate([[3, 'node', 'style', value]]);
    expect(onLimitReached).toHaveBeenCalledTimes(1);
    expect(connection.mutate).not.toHaveBeenCalled();
  });

  it('bounds method arguments and stops both call and mutation channels', () => {
    const connection = { mutate: jest.fn(), call: jest.fn(() => 'focused') };
    const onLimitReached = jest.fn();
    const bounded = createBoundedRemoteConnection(connection, onLimitReached);

    expect(bounded.call('input', 'focus')).toBe('focused');
    bounded.call('input', 'focus', { value: 'x'.repeat(1000001) });
    bounded.call('input', 'focus');
    bounded.mutate([[2, 'text', 'Acme']]);

    expect(onLimitReached).toHaveBeenCalledTimes(1);
    expect(connection.call).toHaveBeenCalledTimes(1);
    expect(connection.mutate).not.toHaveBeenCalled();
  });

  it('stops repeated imperative calls even without DOM mutations', () => {
    const connection = { mutate: jest.fn(), call: jest.fn() };
    const onLimitReached = jest.fn();
    const bounded = createBoundedRemoteConnection(connection, onLimitReached);

    for (let index = 0; index < 10002; index += 1) {
      bounded.call('input', 'focus');
    }

    expect(connection.call).toHaveBeenCalledTimes(10000);
    expect(onLimitReached).toHaveBeenCalledTimes(1);
  });

  it('keeps a long-lived widget alive during sustained moderate rendering', () => {
    const connection = { mutate: jest.fn(), call: jest.fn() };
    const onLimitReached = jest.fn();
    const bounded = createBoundedRemoteConnection(connection, onLimitReached);
    const records: Parameters<RemoteConnection['mutate']>[0] = Array.from(
      { length: 5000 },
      () => [2, 'text', 'Acme'],
    );

    for (let index = 0; index < 100; index += 1) {
      now += 100;
      bounded.mutate(records);
    }
    for (let index = 0; index < 20000; index += 1) {
      now += 1;
      bounded.call('input', 'focus');
    }

    expect(connection.mutate).toHaveBeenCalledTimes(100);
    expect(connection.call).toHaveBeenCalledTimes(20000);
    expect(onLimitReached).not.toHaveBeenCalled();
  });

  it('bounds a mutation burst and never revives a stopped connection', () => {
    const connection = { mutate: jest.fn(), call: jest.fn() };
    const onLimitReached = jest.fn();
    const bounded = createBoundedRemoteConnection(connection, onLimitReached);
    const records: Parameters<RemoteConnection['mutate']>[0] = Array.from(
      { length: 5000 },
      () => [2, 'text', 'Acme'],
    );

    for (let index = 0; index < 51; index += 1) {
      bounded.mutate(records);
    }
    now += 60000;
    bounded.mutate([[2, 'text', 'Acme']]);
    bounded.call('input', 'focus');

    expect(connection.mutate).toHaveBeenCalledTimes(50);
    expect(connection.call).not.toHaveBeenCalled();
    expect(onLimitReached).toHaveBeenCalledTimes(1);
  });
});
