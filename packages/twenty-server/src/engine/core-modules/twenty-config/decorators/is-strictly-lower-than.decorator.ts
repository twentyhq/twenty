import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

export const IsStrictlyLowerThan = (
  property: string,
  validationOptions?: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isStrictlyLowerThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const relatedValue = (args.object as any)[relatedPropertyName];

          return (
            typeof value === 'number' &&
            typeof relatedValue === 'number' &&
            value < relatedValue
          );
        },
      },
    });
  };
};
