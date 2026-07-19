import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

class NestedDto {
  @IsString()
  name!: string;
}

class ParentDto {
  @ValidateNested()
  @Type(() => NestedDto)
  nested!: NestedDto;
}

describe('ResolverValidationPipe', () => {
  const pipe = new ResolverValidationPipe();

  it('should return transformed class instances on success', async () => {
    const result = (await pipe.transform(
      { nested: { name: 'ok' } },
      { type: 'body', metatype: ParentDto, data: '' },
    )) as ParentDto;

    expect(result).toBeInstanceOf(ParentDto);
    expect(result.nested).toBeInstanceOf(NestedDto);
    expect(result.nested.name).toBe('ok');
  });

  it('should throw UserInputError when validation constraints fail', async () => {
    await expect(
      pipe.transform(
        { nested: { name: 123 } },
        { type: 'body', metatype: ParentDto, data: '' },
      ),
    ).rejects.toBeInstanceOf(UserInputError);
  });

  it('should pass through primitive metatypes unchanged', async () => {
    await expect(
      pipe.transform('hello', { type: 'body', metatype: String, data: '' }),
    ).resolves.toBe('hello');
  });
});
