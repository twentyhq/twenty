import {
  type ValidationOptions,
  registerDecorator,
  type ValidationArguments,
} from 'class-validator';

export const AssertOrWarn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  condition: (object: any, value: any) => boolean,
  validationOptions?: ValidationOptions,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
