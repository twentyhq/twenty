import { createCompositeFieldKey } from 'src/engine/api/graphql/workspace-query-builder/utils/composite-field-metadata.util';
import {
  handleCompositeKey,
  parseResult,
} from 'src/engine/api/graphql/workspace-query-runner/utils/parse-result.util';

describe('handleSpecialKey', () => {
  // @ts-expect-error legacy noImplicitAny
  let result;

  beforeEach(() => {
    result = {};
  });

  test('should correctly process a composite key and add it to the result object', () => {
    handleCompositeKey(
      // @ts-expect-error legacy noImplicitAny
      result,
      createCompositeFieldKey('complexField', 'link'),
      'value1',
    );
    // @ts-expect-error legacy noImplicitAny
    expect(result).toEqual({
      complexField: {
        link: 'value1',
      },
    });
  });

  test('should add values under the same newKey if called multiple times', () => {
    handleCompositeKey(
      // @ts-expect-error legacy noImplicitAny
      result,
      createCompositeFieldKey('complexField', 'link'),
      'value1',
    );
    handleCompositeKey(
      // @ts-expect-error legacy noImplicitAny
      result,
      createCompositeFieldKey('complexField', 'text'),
      'value2',
    );
    // @ts-expect-error legacy noImplicitAny
    expect(result).toEqual({
      complexField: {
        link: 'value1',
        text: 'value2',
      },
    });
  });

  test('should not create a new field if the composite key is not correctly formed', () => {
    // @ts-expect-error legacy noImplicitAny
    handleCompositeKey(result, 'COMPOSITE___complexField', 'value1');
    // @ts-expect-error legacy noImplicitAny
    expect(result).toEqual({});
  });
});

describe('parseResult', () => {
  test('should recursively parse an object and handle special keys', () => {
    const obj = {
      normalField: 'value1',
      COMPOSITE___specialField_part1: 'value2',
      nested: {
        COMPOSITE___specialFieldNested_part2: 'value3',
      },
    };

    const expectedResult = {
      normalField: 'value1',
      specialField: {
        part1: 'value2',
      },
      nested: {
        specialFieldNested: {
          part2: 'value3',
        },
      },
    };

    expect(parseResult(obj)).toEqual(expectedResult);
  });

  test('should handle arrays and parse each element', () => {
    const objArray = [
      {
        COMPOSITE___specialField_part1: 'value1',
      },
      {
        COMPOSITE___specialField_part2: 'value2',
      },
    ];

    const expectedResult = [
      {
        specialField: {
          part1: 'value1',
        },
      },
      {
        specialField: {
          part2: 'value2',
        },
      },
    ];

    expect(parseResult(objArray)).toEqual(expectedResult);
  });

  test('should return the original value if it is not an object or array', () => {
    expect(parseResult('stringValue')).toBe('stringValue');
    expect(parseResult(12345)).toBe(12345);
  });
});
