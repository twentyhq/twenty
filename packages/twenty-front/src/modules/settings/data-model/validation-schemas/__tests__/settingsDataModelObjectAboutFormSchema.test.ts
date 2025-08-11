import {
  type SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { type EachTestingContext } from 'twenty-shared/testing';

describe('settingsDataModelObjectAboutFormSchema', () => {
  const validInput: SettingsDataModelObjectAboutFormValues = {
    description: 'A valid description',
    icon: 'IconName',
    labelPlural: 'Labels Plural',
    labelSingular: 'Label Singular',
    namePlural: 'labelsPlural',
    nameSingular: 'labelSingular',
    isLabelSyncedWithName: false,
  };

  const passingTestsUseCase: EachTestingContext<{
    input: SettingsDataModelObjectAboutFormValues;
    expectedSuccess: true;
  }>[] = [
    {
      title: 'validates a complete valid input',
      context: {
        input: validInput,
        expectedSuccess: true,
      },
    },
    {
      title: 'validates input with optional fields omitted',
      context: {
        input: {
          labelPlural: 'Labels Plural',
          labelSingular: 'Label Singular',
          namePlural: 'labelsPlural',
          nameSingular: 'labelSingular',
          isLabelSyncedWithName: false,
        },
        expectedSuccess: true,
      },
    },
    {
      title: 'validates input with trimmed labels',
      context: {
        input: {
          ...validInput,
          labelPlural: '   Labels Plural   ',
          labelSingular: '  Label Singular  ',
        },
        expectedSuccess: true,
      },
    },
  ];

  const failsValidationTestsUseCase: EachTestingContext<{
    input: Partial<Record<keyof SettingsDataModelObjectAboutFormValues, any>>;
    expectedSuccess: false;
  }>[] = [
    {
      title: 'fails when required fields are missing',
      context: {
        input: {
          description: 'Only description',
          labelPlural: undefined,
          labelSingular: undefined,
        },
        expectedSuccess: false,
      },
    },
    {
      title: 'fails when names are not in camelCase',
      context: {
        input: {
          ...validInput,
          namePlural: 'Labels_Plural',
          nameSingular: 'Label-Singular',
        },
        expectedSuccess: false,
      },
    },
    {
      title: 'fails when labels are empty strings',
      context: {
        input: {
          ...validInput,
          labelPlural: '',
          labelSingular: '',
        },
        expectedSuccess: false,
      },
    },
    {
      title: 'fails when singular and plural labels are the same',
      context: {
        input: {
          ...validInput,
          labelPlural: 'Same Label',
          labelSingular: 'Same Label',
        },
        expectedSuccess: false,
      },
    },
    {
      title: 'fails when singular and plural names are the same',
      context: {
        input: {
          ...validInput,
          namePlural: 'sameName',
          nameSingular: 'sameName',
        },
        expectedSuccess: false,
      },
    },
    {
      title: 'fails when isLabelSyncedWithName is not a boolean',
      context: {
        input: {
          ...validInput,
          isLabelSyncedWithName: 'true',
        },
        expectedSuccess: false,
      },
    },
    {
      title: 'fails with invalid types for optional fields',
      context: {
        input: {
          ...validInput,
          description: 123,
          icon: true,
        },
        expectedSuccess: false,
      },
    },
  ];

  test.each([...passingTestsUseCase, ...failsValidationTestsUseCase])(
    '$title',
    ({ context: { expectedSuccess, input } }) => {
      const result = settingsDataModelObjectAboutFormSchema.safeParse({
        ...validInput,
        ...input,
      });
      expect(result.success).toBe(expectedSuccess);
      if (!expectedSuccess) {
        expect(result.error).toMatchSnapshot();
      }
    },
  );
});
