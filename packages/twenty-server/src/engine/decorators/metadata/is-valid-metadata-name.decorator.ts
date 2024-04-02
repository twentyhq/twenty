import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const IsValidMetadataName =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsValidName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) =>
          /^(?!(?:not|or|and|Int|Float|Boolean|String|ID)$)[^'"\\;.=*/]+$/.test(
            value,
          ),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} has failed the name validation check`,
      },
    });
  };
