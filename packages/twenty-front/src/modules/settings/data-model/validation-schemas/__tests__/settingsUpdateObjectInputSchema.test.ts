import { SafeParseSuccess } from 'zod';

import { UpdateObjectPayload } from '~/generated-metadata/graphql';

import { settingsUpdateObjectInputSchema } from '../settingsUpdateObjectInputSchema';

describe('settingsUpdateObjectInputSchema', () => {
  it('validates a valid input and adds name properties', () => {
    // Given
    const validInput = {
      description: 'A valid description',
      icon: 'IconName',
      labelPlural: 'Labels Plural    ',
      labelSingular: '   Label Singular',
      namePlural: 'namePlural',
      nameSingular: 'nameSingular',
      labelIdentifierFieldMetadataId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    };

    // When
    const result = settingsUpdateObjectInputSchema.safeParse(validInput);

    // Then
    expect(result.success).toBe(true);
    expect((result as SafeParseSuccess<UpdateObjectPayload>).data).toEqual({
      description: validInput.description,
      icon: validInput.icon,
      labelIdentifierFieldMetadataId: validInput.labelIdentifierFieldMetadataId,
      labelPlural: 'Labels Plural',
      labelSingular: 'Label Singular',
      namePlural: 'namePlural',
      nameSingular: 'nameSingular',
    });
  });

  it('fails for an invalid input', () => {
    // Given
    const invalidInput = {
      description: 123,
      icon: true,
      labelPlural: [],
      labelSingular: {},
      labelIdentifierFieldMetadataId: 'invalid uuid',
    };

    // When
    const result = settingsUpdateObjectInputSchema.safeParse(invalidInput);

    // Then
    expect(result.success).toBe(false);
  });
});
