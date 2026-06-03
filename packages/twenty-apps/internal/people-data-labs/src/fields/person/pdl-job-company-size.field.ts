import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlJobCompanySize,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlJobCompanySize',
  label: 'Current Company Size',
  description: 'Current company size range returned by People Data Labs.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanySize.oneToTen,
      value: 'ONE_TO_TEN',
      label: '1-10',
      color: 'gray',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanySize
        .elevenToFifty,
      value: 'ELEVEN_TO_FIFTY',
      label: '11-50',
      color: 'green',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanySize
        .fiftyOneToTwoHundred,
      value: 'FIFTY_ONE_TO_TWO_HUNDRED',
      label: '51-200',
      color: 'turquoise',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanySize
        .twoHundredOneToFiveHundred,
      value: 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
      label: '201-500',
      color: 'sky',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanySize
        .fiveHundredOneToOneThousand,
      value: 'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND',
      label: '501-1000',
      color: 'blue',
      position: 4,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanySize
        .oneThousandOneToFiveThousand,
      value: 'ONE_THOUSAND_ONE_TO_FIVE_THOUSAND',
      label: '1001-5000',
      color: 'purple',
      position: 5,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanySize
        .fiveThousandOneToTenThousand,
      value: 'FIVE_THOUSAND_ONE_TO_TEN_THOUSAND',
      label: '5001-10000',
      color: 'pink',
      position: 6,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanySize
        .tenThousandOnePlus,
      value: 'TEN_THOUSAND_ONE_PLUS',
      label: '10001+',
      color: 'red',
      position: 7,
    },
  ],
});
