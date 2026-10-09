import { applyInputSelectionRequestToRange } from '../applyInputSelectionRequestToRange';

const VALUE_LENGTH = 'abcdef'.length;

describe('applyInputSelectionRequestToRange', () => {
  it('should move the end with the start setter and keep the direction', () => {
    const rangeAfterStart = applyInputSelectionRequestToRange({
      range: {
        selectionStart: 1,
        selectionEnd: 3,
        selectionDirection: 'backward',
      },
      request: { property: 'selectionStart', value: 4 },
      valueLength: VALUE_LENGTH,
    });

    expect(rangeAfterStart).toEqual({
      selectionStart: 4,
      selectionEnd: 4,
      selectionDirection: 'backward',
    });
    expect(
      applyInputSelectionRequestToRange({
        range: rangeAfterStart,
        request: { property: 'selectionEnd', value: 2 },
        valueLength: VALUE_LENGTH,
      }),
    ).toEqual({
      selectionStart: 2,
      selectionEnd: 2,
      selectionDirection: 'backward',
    });
  });

  it('should change only the direction with the direction setter', () => {
    expect(
      applyInputSelectionRequestToRange({
        range: {
          selectionStart: 1,
          selectionEnd: 3,
          selectionDirection: 'none',
        },
        request: { property: 'selectionDirection', value: 'forward' },
        valueLength: VALUE_LENGTH,
      }),
    ).toEqual({
      selectionStart: 1,
      selectionEnd: 3,
      selectionDirection: 'forward',
    });
  });
});
