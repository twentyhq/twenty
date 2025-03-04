import { settingsDataModelObjectAboutFormSchema } from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { SafeParseSuccess } from 'zod';

import { UpdateObjectPayload } from '~/generated-metadata/graphql';

describe('settingsDataModelObjectAboutFormSchema', () => {
  it('validates a valid input and adds name properties', () => {
    // Given
    const validInput = {
      description: 'A valid description',
      icon: 'IconName',
      labelPlural: 'Labels Plural    ',
      labelSingular: '   Label Singular',
      namePlural: 'namePlural',
      nameSingular: 'nameSingular',
    };

    // When
    const result = settingsDataModelObjectAboutFormSchema.safeParse(validInput);

    // Then
    expect(result.success).toBe(true);
    expect((result as SafeParseSuccess<UpdateObjectPayload>).data).toEqual({
      description: validInput.description,
      icon: validInput.icon,
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
    };

    // When
    const result =
      settingsDataModelObjectAboutFormSchema.safeParse(invalidInput);

    // Then
    expect(result.success).toBe(false);
  });
});
