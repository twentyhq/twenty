import { faker } from '@faker-js/faker';
import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const generateRandomFieldValue = ({
  field,
}: {
  field: FieldMetadataEntity | FlatFieldMetadata;
}): FieldMetadataDefaultValue => {
  switch (field.type) {
    case FieldMetadataType.UUID: {
      return v4();
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
      return faker.date.soon();
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
        amountMicros: faker.number.int({ min: 100, max: 1_000 }) * 1_000_000,
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

    case FieldMetadataType.RICH_TEXT:
    case FieldMetadataType.RICH_TEXT_V2: {
      return '';
    }

    case FieldMetadataType.ACTOR: {
      return {
        source: 'MANUAL',
        context: {},
        name: faker.person.fullName(),
        workspaceMemberId: null,
      };
    }

    case FieldMetadataType.ARRAY: {
      return [];
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
