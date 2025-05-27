import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';

import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { applyBasicValidators } from 'src/engine/core-modules/twenty-config/utils/apply-basic-validators.util';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';

jest.mock('class-transformer', () => ({
  Transform: jest.fn(),
}));

jest.mock('class-validator', () => ({
  IsBoolean: jest.fn().mockReturnValue(jest.fn()),
  IsNumber: jest.fn().mockReturnValue(jest.fn()),
  IsString: jest.fn().mockReturnValue(jest.fn()),
  IsEnum: jest.fn().mockReturnValue(jest.fn()),
  IsArray: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock(
  'src/engine/core-modules/twenty-config/utils/config-transformers.util',
  () => ({
    configTransformers: {
      boolean: jest.fn(),
      number: jest.fn(),
    },
  }),
);

describe('applyBasicValidators', () => {
  const mockTarget = {};
  const mockPropertyKey = 'testProperty';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('boolean type', () => {
    it('should apply boolean transformers and validators', () => {
      let capturedTransformFn;

      (Transform as jest.Mock).mockImplementation((transformFn) => {
        capturedTransformFn = transformFn;

        return jest.fn();
      });

      applyBasicValidators(
        ConfigVariableType.BOOLEAN,
        mockTarget,
        mockPropertyKey,
      );

      expect(Transform).toHaveBeenCalled();
      expect(IsBoolean).toHaveBeenCalled();

      const transformFn = capturedTransformFn;
      const mockTransformParams = { value: 'true' };

      (configTransformers.boolean as jest.Mock).mockReturnValueOnce(true);
      // @ts-expect-error legacy noImplicitAny
      const result1 = transformFn(mockTransformParams);

      expect(configTransformers.boolean).toHaveBeenCalledWith('true');
      expect(result1).toBe(true);

      (configTransformers.boolean as jest.Mock).mockReturnValueOnce(undefined);
      // @ts-expect-error legacy noImplicitAny
      const result2 = transformFn(mockTransformParams);

      expect(result2).toBe('true');
    });
  });

  describe('number type', () => {
    it('should apply number transformers and validators', () => {
      let capturedTransformFn;

      (Transform as jest.Mock).mockImplementation((transformFn) => {
        capturedTransformFn = transformFn;

        return jest.fn();
      });

      applyBasicValidators(
        ConfigVariableType.NUMBER,
        mockTarget,
        mockPropertyKey,
      );

      expect(Transform).toHaveBeenCalled();
      expect(IsNumber).toHaveBeenCalled();

      const transformFn = capturedTransformFn;
      const mockTransformParams = { value: '42' };

      (configTransformers.number as jest.Mock).mockReturnValueOnce(42);
      // @ts-expect-error legacy noImplicitAny
      const result1 = transformFn(mockTransformParams);

      expect(configTransformers.number).toHaveBeenCalledWith('42');
      expect(result1).toBe(42);

      (configTransformers.number as jest.Mock).mockReturnValueOnce(undefined);
      // @ts-expect-error legacy noImplicitAny
      const result2 = transformFn(mockTransformParams);

      expect(result2).toBe('42');
    });
  });

  describe('string type', () => {
    it('should apply string validator', () => {
      applyBasicValidators(
        ConfigVariableType.STRING,
        mockTarget,
        mockPropertyKey,
      );

      expect(IsString).toHaveBeenCalled();
      expect(Transform).not.toHaveBeenCalled();
    });
  });

  describe('enum type', () => {
    it('should apply enum validator with string array options', () => {
      const enumOptions = ['option1', 'option2', 'option3'];

      applyBasicValidators(
        ConfigVariableType.ENUM,
        mockTarget,
        mockPropertyKey,
        enumOptions,
      );

      expect(IsEnum).toHaveBeenCalledWith(enumOptions);
      expect(Transform).not.toHaveBeenCalled();
    });

    it('should apply enum validator with enum object options', () => {
      enum TestEnum {
        Option1 = 'value1',
        Option2 = 'value2',
        Option3 = 'value3',
      }

      jest.mock(
        'src/engine/core-modules/twenty-config/utils/type-transformers.registry',
        () => ({
          typeTransformers: {
            enum: {
              getValidators: jest.fn().mockImplementation((options) => {
                if (options && Object.keys(options).length > 0) {
                  return [IsEnum(options)];
                }

                return [];
              }),
              getTransformers: jest.fn().mockReturnValue([]),
            },
          },
        }),
        { virtual: true },
      );

      applyBasicValidators(
        ConfigVariableType.ENUM,
        mockTarget,
        mockPropertyKey,
        TestEnum,
      );

      expect(IsEnum).toHaveBeenCalledWith(TestEnum);
      expect(Transform).not.toHaveBeenCalled();
    });

    it('should not apply enum validator without options', () => {
      applyBasicValidators(
        ConfigVariableType.ENUM,
        mockTarget,
        mockPropertyKey,
      );

      expect(IsEnum).not.toHaveBeenCalled();
      expect(Transform).not.toHaveBeenCalled();
    });
  });

  describe('array type', () => {
    it('should apply array validator', () => {
      applyBasicValidators(
        ConfigVariableType.ARRAY,
        mockTarget,
        mockPropertyKey,
      );

      expect(IsArray).toHaveBeenCalled();
      expect(Transform).not.toHaveBeenCalled();
    });
  });

  describe('unsupported type', () => {
    it('should throw error for unsupported types', () => {
      expect(() => {
        applyBasicValidators('unsupported' as any, mockTarget, mockPropertyKey);
      }).toThrow('Unsupported config variable type: unsupported');
    });
  });
});
