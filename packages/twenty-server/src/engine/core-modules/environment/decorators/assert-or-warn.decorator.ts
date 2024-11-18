import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

export const AssertOrWarn = (
  condition: (object: any, value: any) => boolean,
  validationOptions?: ValidationOptions,
) => {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'AssertOrWarn',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        groups: ['warning'],
      },
      constraints: [condition],
      validator: {
        validate(value: any, args: ValidationArguments) {
          return condition(args.object, value);
        },
        defaultMessage(args: ValidationArguments) {
          return `'${args.property}' failed the warning validation.`;
        },
      },
    });
  };
};
