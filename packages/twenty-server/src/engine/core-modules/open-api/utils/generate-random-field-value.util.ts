import { en, Faker } from '@faker-js/faker';
import {
  type FieldMetadataDefaultValue,
  FieldMetadataType,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type ExampleField = Pick<
  FieldMetadataEntity | FlatFieldMetadata,
  'name' | 'type' | 'options'
>;

// Its own instance so seeding cannot disturb the shared faker other callers use.
const faker = new Faker({ locale: en });

// CI diffs this document against the one main generates, so an example may only
// depend on the field it describes. Field ids are per-workspace, hence the name.
const seedForField = (field: ExampleField) => {
  let seed = 0;

  for (const character of `${field.name}:${field.type}`) {
    seed = (seed * 31 + character.charCodeAt(0)) | 0;
  }

  faker.seed(Math.abs(seed));
};

// Anchors faker.date, which is otherwise relative to the moment of generation.
const EXAMPLE_REFERENCE_DATE = new Date('2024-01-01T00:00:00.000Z');

export const generateRandomFieldValue = ({
  field,
}: {
  field: ExampleField;
}): FieldMetadataDefaultValue => {
  seedForField(field);

  switch (field.type) {
    case FieldMetadataType.UUID: {
      return faker.string.uuid();
    }

    case FieldMetadataType.TEXT: {
      return faker.string.fromCharacters(field.name);
    }

    case FieldMetadataType.PHONES: {
      return {
        primaryPhoneNumber: '06 10 20 30 40',
        primaryPhoneCallingCode: '+33',
        primaryPhoneCountryCode: 'FR',
        additionalPhones: [],
      };
    }

    case FieldMetadataType.EMAILS: {
      return {
        primaryEmail: faker.internet.email().toLowerCase(),
        additionalEmails: null,
      };
    }

    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME: {
      return faker.date.soon({ refDate: EXAMPLE_REFERENCE_DATE });
    }

    case FieldMetadataType.BOOLEAN: {
      return false;
    }

    case FieldMetadataType.NUMBER: {
      return faker.number.float({ min: 1, max: 1_000 });
    }

    case FieldMetadataType.NUMERIC: {
      return faker.number.int({ min: 1, max: 1_000 });
    }

    case FieldMetadataType.LINKS: {
      return {
        primaryLinkLabel: '',
        primaryLinkUrl: faker.internet.url(),
        secondaryLinks: [],
      };
    }

    case FieldMetadataType.CURRENCY: {
      return {
        amountMicros: `${faker.number.int({ min: 100, max: 1_000 }) * 1_000_000}`,
        currencyCode: 'EUR',
      };
    }

    case FieldMetadataType.FULL_NAME: {
      return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
    }

    case FieldMetadataType.RATING: {
      return 'RATING_5';
    }

    case FieldMetadataType.SELECT: {
      if (!isDefined(field.options) || !isDefined(field.options[0].value)) {
        return null;
      }

      return field.options[0].value;
    }

    case FieldMetadataType.MULTI_SELECT: {
      if (!isDefined(field.options) || !isDefined(field.options[0].value)) {
        return [];
      }

      return [field.options[0].value];
    }

    case FieldMetadataType.RELATION:
    case FieldMetadataType.MORPH_RELATION: {
      return null;
    }

    case FieldMetadataType.POSITION: {
      return 1;
    }

    case FieldMetadataType.ADDRESS: {
      return {
        addressStreet1: faker.location.streetAddress(),
        addressStreet2: faker.location.secondaryAddress(),
        addressCity: faker.location.city(),
        addressState: faker.location.state(),
        addressCountry: faker.location.country(),
        addressPostcode: faker.location.zipCode(),
        addressLat: faker.location.latitude(),
        addressLng: faker.location.longitude(),
      };
    }

    case FieldMetadataType.RAW_JSON: {
      return {};
    }

    case FieldMetadataType.RICH_TEXT: {
      return '';
    }

    case FieldMetadataType.ACTOR: {
      return {
        source: 'MANUAL',
        name: faker.person.fullName(),
        workspaceMemberId: null,
      };
    }

    case FieldMetadataType.ARRAY: {
      return [];
    }

    case FieldMetadataType.FILES: {
      return null;
    }

    case FieldMetadataType.TS_VECTOR: {
      throw new Error(
        `We should not generate fake version for ${field.type} field`,
      );
    }

    default: {
      assertUnreachable(field.type, `Unsupported field type '${field.type}'`);
    }
  }
};
