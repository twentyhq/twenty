import { remoteId } from '@remote-dom/core/elements';
import { Window } from '@remote-dom/polyfill';

import { findElementByRemoteId } from '../findElementByRemoteId';

const createPolyfillDocument = (): Document =>
  new Window().document as unknown as Document;

describe('findElementByRemoteId', () => {
  it('should find the element carrying the remote id under the root', () => {
    const document = createPolyfillDocument();
    const list = document.createElement('div');
    const item = document.createElement('button');

    list.append(item);
    document.body.append(list);

    expect(
      findElementByRemoteId({
        rootNode: document.body,
        remoteElementId: remoteId(item),
      }),
    ).toBe(item);
  });

  it('should return null when no element carries the remote id', () => {
    const document = createPolyfillDocument();

    document.body.append(document.createElement('div'));

    expect(
      findElementByRemoteId({
        rootNode: document.body,
        remoteElementId: 'missing',
      }),
    ).toBeNull();
  });

  it('should ignore text nodes carrying the remote id', () => {
    const document = createPolyfillDocument();
    const label = document.createTextNode('Overview');

    document.body.append(label);

    expect(
      findElementByRemoteId({
        rootNode: document.body,
        remoteElementId: remoteId(label),
      }),
    ).toBeNull();
  });
});
