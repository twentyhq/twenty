import { BadRequestException } from '@nestjs/common';

export const assertIsValidUuid = (value: string) => {
  const isValid =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
      value,
    );

  if (!isValid) {
    throw new BadRequestException(`Value "${value}" is not a valid UUID`);
  }
};
