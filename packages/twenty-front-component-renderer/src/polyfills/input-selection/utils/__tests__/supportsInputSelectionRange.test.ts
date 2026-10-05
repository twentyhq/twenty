import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

import { supportsInputSelectionRange } from '../supportsInputSelectionRange';

const createRemoteControl = ({
  localName,
  type,
}: {
  localName: string;
  type?: string;
}): SelectorElementLike => ({
  localName,
  getAttribute: (attributeName: string) =>
    attributeName === 'type' ? (type ?? null) : null,
});

describe('supportsInputSelectionRange', () => {
  it.each([
    '',
    undefined,
    'text',
    'TEXT',
    'search',
    'url',
    'tel',
    'password',
    'datetime',
    'bogus',
  ])('should support the range API on an input of type %p', (type) => {
    expect(
      supportsInputSelectionRange(
        createRemoteControl({ localName: 'html-input', type }),
      ),
    ).toBe(true);
  });

  it.each(['email', 'number', 'checkbox', 'date'])(
    'should not support the range API on an input of type %s',
    (type) => {
      expect(
        supportsInputSelectionRange(
          createRemoteControl({ localName: 'html-input', type }),
        ),
      ).toBe(false);
    },
  );

  it('should support the range API on a textarea', () => {
    expect(
      supportsInputSelectionRange(
        createRemoteControl({ localName: 'html-textarea' }),
      ),
    ).toBe(true);
  });
});
