import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

import { supportsInputSelectionRange } from '../supportsInputSelectionRange';

const createRemoteInput = (type: string): SelectorElementLike => ({
  localName: 'html-input',
  getAttribute: (attributeName: string) =>
    attributeName === 'type' ? type : null,
});

describe('supportsInputSelectionRange', () => {
  it.each(['text', 'search', 'url', 'tel', 'password'])(
    'should support the range API on an input of type %s',
    (type) => {
      expect(supportsInputSelectionRange(createRemoteInput(type))).toBe(true);
    },
  );

  it.each(['email', 'number', 'checkbox', 'date'])(
    'should not support the range API on an input of type %s',
    (type) => {
      expect(supportsInputSelectionRange(createRemoteInput(type))).toBe(false);
    },
  );
});
