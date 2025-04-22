import { plainToClass } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import 'reflect-metadata';

import { AssertOrWarn } from 'src/engine/core-modules/twenty-config/decorators/assert-or-warn.decorator';

describe('AssertOrWarn Decorator', () => {
  it('should pass validation if the condition is met', () => {
    class ConfigVariables {
      @AssertOrWarn((object, value) => value > 10, {
        message: 'Value should be higher than 10',
      })
      someProperty!: number;
    }

    const validatedConfig = plainToClass(ConfigVariables, {
      someProperty: 15,
    });

    const warnings = validateSync(validatedConfig, { groups: ['warning'] });

    expect(warnings.length).toBe(0);
  });

  it('should provide a warning message if the condition is not met', () => {
    class ConfigVariables {
      @AssertOrWarn((object, value) => value > 10, {
        message: 'Value should be higher than 10',
      })
      someProperty!: number;
    }

    const validatedConfig = plainToClass(ConfigVariables, {
      someProperty: 9,
    });

    const warnings = validateSync(validatedConfig, { groups: ['warning'] });

    expect(warnings.length).toBe(1);
    expect(warnings[0].constraints!.AssertOrWarn).toBe(
      'Value should be higher than 10',
    );
  });

  it('should not impact errors if the condition is not met', () => {
    class ConfigVariables {
      @IsString()
      unit: string;

      @AssertOrWarn(
        (object, value) => object.unit == 's' && value.toString().length <= 10,
        {
          message: 'The unit is in seconds but the duration in milliseconds',
        },
      )
      duration!: number;
    }

    const validatedConfig = plainToClass(ConfigVariables, {
      duration: 1731944140876000,
      unit: 's',
    });

    const warnings = validateSync(validatedConfig, { groups: ['warning'] });
    const errors = validateSync(validatedConfig, { strictGroups: true });

    expect(errors.length).toBe(0);
    expect(warnings.length).toBe(1);
    expect(warnings[0].constraints!.AssertOrWarn).toBe(
      'The unit is in seconds but the duration in milliseconds',
    );
  });
});
