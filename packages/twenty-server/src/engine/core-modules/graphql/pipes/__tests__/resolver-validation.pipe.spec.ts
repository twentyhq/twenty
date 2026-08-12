import { type ArgumentMetadata, type Type } from '@nestjs/common';

import { IsString } from 'class-validator';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

class DecoratedInput {
  @IsString()
  name!: string;
}

class PlainInput {
  name!: string;
}

const argMetadata = (metatype?: Type<unknown>): ArgumentMetadata => ({
  type: 'body',
  metatype,
  data: '',
});

describe('ResolverValidationPipe', () => {
  const pipe = new ResolverValidationPipe();

  it('should return the value when a decorated field is valid', async () => {
    await expect(
      pipe.transform({ name: 'ok' }, argMetadata(DecoratedInput)),
    ).resolves.toEqual({ name: 'ok' });
  });

  it('should throw UserInputError when a decorated field is invalid', async () => {
    await expect(
      pipe.transform({ name: 42 }, argMetadata(DecoratedInput)),
    ).rejects.toBeInstanceOf(UserInputError);
  });

  it('should return the value for a class without validation metadata', async () => {
    await expect(
      pipe.transform({ name: 42 }, argMetadata(PlainInput)),
    ).resolves.toEqual({ name: 42 });
  });

  it('should return the value for primitive metatypes', async () => {
    await expect(pipe.transform('x', argMetadata(String))).resolves.toBe('x');
  });

  it('should return the value when there is no metatype', async () => {
    await expect(pipe.transform('x', argMetadata(undefined))).resolves.toBe(
      'x',
    );
  });
});
