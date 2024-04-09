import { SafeParseSuccess } from 'zod';

import { CreateObjectInput } from '~/generated-metadata/graphql';

import { settingsCreateObjectInputSchema } from '../settingsCreateObjectInputSchema';

describe('settingsCreateObjectInputSchema', () => {
  it('validates a valid input and adds name properties', () => {
    // Given
    const validInput = {
      description: 'A valid description',
      icon: 'IconPlus',
      labelPlural: ' Labels     ',
      labelSingular: 'Label ',
    };

    // When
    const result = settingsCreateObjectInputSchema.safeParse(validInput);

    // Then
    expect(result.success).toBe(true);
    expect((result as SafeParseSuccess<CreateObjectInput>).data).toEqual({
      description: validInput.description,
      icon: validInput.icon,
      labelPlural: 'Labels',
      labelSingular: 'Label',
      namePlural: 'labels',
      nameSingular: 'label',
    });
  });

  it('fails for an invalid input', () => {
    // Given
    const invalidInput = {
      description: 123,
      icon: true,
      labelPlural: [],
      labelSingular: {},
    };

    // When
    const result = settingsCreateObjectInputSchema.safeParse(invalidInput);

    // Then
    expect(result.success).toBe(false);
  });
});
