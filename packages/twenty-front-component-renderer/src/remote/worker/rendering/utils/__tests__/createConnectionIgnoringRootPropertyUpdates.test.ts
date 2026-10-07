import {
  MUTATION_TYPE_INSERT_CHILD,
  MUTATION_TYPE_UPDATE_PROPERTY,
  NODE_TYPE_TEXT,
  ROOT_ID,
  UPDATE_PROPERTY_TYPE_ATTRIBUTE,
  type RemoteMutationRecord,
} from '@remote-dom/core';

import { createConnectionIgnoringRootPropertyUpdates } from '../createConnectionIgnoringRootPropertyUpdates';

const PORTAL_INSERTION: RemoteMutationRecord = [
  MUTATION_TYPE_INSERT_CHILD,
  ROOT_ID,
  { id: 'portal-text', type: NODE_TYPE_TEXT, data: 'Portal' },
  1,
];

const BODY_STYLE_UPDATE: RemoteMutationRecord = [
  MUTATION_TYPE_UPDATE_PROPERTY,
  ROOT_ID,
  'style',
  'overflow: hidden',
  UPDATE_PROPERTY_TYPE_ATTRIBUTE,
];

const PORTAL_STYLE_UPDATE: RemoteMutationRecord = [
  MUTATION_TYPE_UPDATE_PROPERTY,
  'portal',
  'style',
  'color: red',
  UPDATE_PROPERTY_TYPE_ATTRIBUTE,
];

describe('createConnectionIgnoringRootPropertyUpdates', () => {
  it('drops property updates on the body root and forwards every other mutation in order', () => {
    const connection = { call: jest.fn(), mutate: jest.fn() };

    createConnectionIgnoringRootPropertyUpdates(connection).mutate([
      PORTAL_INSERTION,
      BODY_STYLE_UPDATE,
      PORTAL_STYLE_UPDATE,
    ]);

    expect(connection.mutate).toHaveBeenCalledTimes(1);
    expect(connection.mutate).toHaveBeenCalledWith([
      PORTAL_INSERTION,
      PORTAL_STYLE_UPDATE,
    ]);
  });

  it('does not forward a batch that only updates body properties', () => {
    const connection = { call: jest.fn(), mutate: jest.fn() };

    createConnectionIgnoringRootPropertyUpdates(connection).mutate([
      BODY_STYLE_UPDATE,
    ]);

    expect(connection.mutate).not.toHaveBeenCalled();
  });

  it('forwards method calls unchanged', () => {
    const connection = { call: jest.fn(), mutate: jest.fn() };

    createConnectionIgnoringRootPropertyUpdates(connection).call(
      'portal',
      'focus',
      { preventScroll: true },
    );

    expect(connection.call).toHaveBeenCalledWith('portal', 'focus', {
      preventScroll: true,
    });
  });
});
