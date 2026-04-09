import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { typeTransformers } from 'src/engine/core-modules/twenty-config/utils/type-transformers.registry';

describe('Type Transformers Registry', () => {
  describe('Boolean Transformer', () => {
    const booleanTransformer = typeTransformers[ConfigVariableType.BOOLEAN];

    describe('toApp', () => {
      it('should convert string "true" to boolean true', () => {
        expect(booleanTransformer.toApp('true')).toBe(true);
      });

      it('should convert string "false" to boolean false', () => {
        expect(booleanTransformer.toApp('false')).toBe(false);
      });

      it('should return undefined for null or undefined', () => {
        expect(booleanTransformer.toApp(null)).toBeUndefined();
        expect(booleanTransformer.toApp(undefined)).toBeUndefined();
      });
    });

    describe('toStorage', () => {
      it('should keep boolean values unchanged', () => {
        expect(booleanTransformer.toStorage(true)).toBe(true);
        expect(booleanTransformer.toStorage(false)).toBe(false);
      });

      it('should throw error for non-boolean values', () => {
        expect(() => {
          booleanTransformer.toStorage('true' as any);
        }).toThrow();
      });
    });
  });

  describe('Number Transformer', () => {
    const numberTransformer = typeTransformers[ConfigVariableType.NUMBER];

    describe('toApp', () => {
      it('should convert string number to number', () => {
        expect(numberTransformer.toApp('123')).toBe(123);
      });

      it('should return undefined for non-parseable strings', () => {
        expect(numberTransformer.toApp('not-a-number')).toBeUndefined();
      });

      it('should return undefined for null or undefined', () => {
        expect(numberTransformer.toApp(null)).toBeUndefined();
        expect(numberTransformer.toApp(undefined)).toBeUndefined();
      });
    });

    describe('toStorage', () => {
      it('should keep number values unchanged', () => {
        expect(numberTransformer.toStorage(123)).toBe(123);
      });

      it('should throw error for non-number values', () => {
        expect(() => {
          numberTransformer.toStorage('123' as any);
        }).toThrow();
      });
    });
  });

  describe('String Transformer', () => {
    const stringTransformer = typeTransformers[ConfigVariableType.STRING];

    describe('toApp', () => {
      it('should keep string values unchanged', () => {
        expect(stringTransformer.toApp('hello')).toBe('hello');
      });

      it('should convert numbers to strings', () => {
        expect(stringTransformer.toApp(123)).toBe('123');
      });

      it('should return undefined for null or undefined', () => {
        expect(stringTransformer.toApp(null)).toBeUndefined();
        expect(stringTransformer.toApp(undefined)).toBeUndefined();
      });
    });

    describe('toStorage', () => {
      it('should keep string values unchanged', () => {
        expect(stringTransformer.toStorage('hello')).toBe('hello');
      });

      it('should throw error for non-string values', () => {
        expect(() => {
          stringTransformer.toStorage(123 as any);
        }).toThrow();
      });
    });
  });

  describe('Array Transformer', () => {
    const arrayTransformer = typeTransformers[ConfigVariableType.ARRAY];

    describe('toApp', () => {
      it('should keep array values unchanged', () => {
        const array = [1, 2, 3];

        expect(arrayTransformer.toApp(array)).toEqual(array);
      });

      it('should convert comma-separated string to array', () => {
        expect(arrayTransformer.toApp('a,b,c')).toEqual(['a', 'b', 'c']);
      });

      it('should filter array values based on options', () => {
        expect(
          arrayTransformer.toApp(['a', 'b', 'c', 'd'], ['a', 'c']),
        ).toEqual(['a', 'c']);
      });

      it('should return undefined for null or undefined', () => {
        expect(arrayTransformer.toApp(null)).toBeUndefined();
        expect(arrayTransformer.toApp(undefined)).toBeUndefined();
      });
    });

    describe('toStorage', () => {
      it('should keep array values unchanged', () => {
        const array = [1, 2, 3];

        expect(arrayTransformer.toStorage(array)).toEqual(array);
      });

      it('should filter array values based on options', () => {
        expect(
          arrayTransformer.toStorage(['a', 'b', 'c', 'd'], ['a', 'c']),
        ).toEqual(['a', 'c']);
      });

      it('should throw error for non-array values', () => {
        expect(() => {
          arrayTransformer.toStorage('not-an-array' as any);
        }).toThrow();
      });
    });
  });

  describe('Enum Transformer', () => {
    const enumTransformer = typeTransformers[ConfigVariableType.ENUM];
    const options = ['option1', 'option2', 'option3'];

    describe('toApp', () => {
      it('should keep valid enum values unchanged', () => {
        expect(enumTransformer.toApp('option1', options)).toBe('option1');
      });

      it('should return undefined for invalid enum values', () => {
        expect(
          enumTransformer.toApp('invalid-option', options),
        ).toBeUndefined();
      });

      it('should return the value if no options are provided', () => {
        expect(enumTransformer.toApp('any-value')).toBe('any-value');
      });

      it('should return undefined for null or undefined', () => {
        expect(enumTransformer.toApp(null)).toBeUndefined();
        expect(enumTransformer.toApp(undefined)).toBeUndefined();
      });
    });

    describe('toStorage', () => {
      it('should keep valid enum values unchanged', () => {
        expect(enumTransformer.toStorage('option1', options)).toBe('option1');
      });

      it('should throw error for invalid enum values', () => {
        expect(() => {
          enumTransformer.toStorage('invalid-option', options);
        }).toThrow();
      });

      it('should throw error for non-string values', () => {
        expect(() => {
          enumTransformer.toStorage(123 as any, options);
        }).toThrow();
      });
    });
  });
});
