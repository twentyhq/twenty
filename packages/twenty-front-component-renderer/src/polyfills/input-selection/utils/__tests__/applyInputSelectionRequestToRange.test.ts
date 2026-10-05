import { type InputSelectionRange } from '@/types/InputSelectionRange';

import { applyInputSelectionRequestToRange } from '../applyInputSelectionRequestToRange';

const VALUE_LENGTH = 'abcdef'.length;

const COLLAPSED_RANGE: InputSelectionRange = {
  selectionStart: 0,
  selectionEnd: 0,
  selectionDirection: 'none',
};

describe('applyInputSelectionRequestToRange', () => {
  it('should collapse a range whose start is after its end', () => {
    expect(
      applyInputSelectionRequestToRange({
        range: COLLAPSED_RANGE,
        request: {
          method: 'setSelectionRange',
          start: 10,
          end: 2,
          direction: 'forward',
        },
        valueLength: VALUE_LENGTH,
      }),
    ).toEqual({
      selectionStart: 2,
      selectionEnd: 2,
      selectionDirection: 'forward',
    });
  });

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

  it('should select the whole value', () => {
    expect(
      applyInputSelectionRequestToRange({
        range: {
          selectionStart: 2,
          selectionEnd: 3,
          selectionDirection: 'backward',
        },
        request: { method: 'select' },
        valueLength: VALUE_LENGTH,
      }),
    ).toEqual({
      selectionStart: 0,
      selectionEnd: 6,
      selectionDirection: 'none',
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

  it('should clamp an offset beyond the value length', () => {
    expect(
      applyInputSelectionRequestToRange({
        range: COLLAPSED_RANGE,
        request: {
          method: 'setSelectionRange',
          start: 4294967295,
          end: 2,
          direction: 'none',
        },
        valueLength: VALUE_LENGTH,
      }),
    ).toEqual({
      selectionStart: 2,
      selectionEnd: 2,
      selectionDirection: 'none',
    });
  });
});
