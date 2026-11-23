/* @license Enterprise */

import * as crypto from 'crypto';

import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import { getCertificateBase64Body } from 'src/engine/core-modules/sso/utils/get-certificate-base64-body.util';

@ValidatorConstraint({ async: false })
export class IsX509CertificateConstraint implements ValidatorConstraintInterface {
  // oxlint-disable-next-line typescript/no-explicit-any
  validate(value: any) {
    if (typeof value !== 'string') {
      return false;
    }

    try {
      const base64Body = getCertificateBase64Body(value);

      const cert = new crypto.X509Certificate(
        Buffer.from(base64Body, 'base64'),
      );

      return cert.raw.toString('base64') === base64Body;
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
