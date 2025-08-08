/* @license Enterprise */

import * as crypto from 'crypto';

import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsX509CertificateConstraint
  implements ValidatorConstraintInterface
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any) {
    if (typeof value !== 'string') {
      return false;
    }

    try {
      const cleanCert = value.replace(
        /-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n|\r/g,
        '',
      );

      const der = Buffer.from(cleanCert, 'base64');

      const cert = new crypto.X509Certificate(der);

      return cert instanceof crypto.X509Certificate;
    } catch {
      return false;
    }
  }

  defaultMessage() {
    return 'The string is not a valid X509 certificate';
  }
}

export function IsX509Certificate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsX509CertificateConstraint,
    });
  };
}
