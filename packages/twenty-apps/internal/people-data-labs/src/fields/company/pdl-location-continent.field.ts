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
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlLocationContinent,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlLocationContinent',
  label: 'Continent',
  description: 'People Data Labs canonical continent.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyLocationContinent
        .africa,
      value: 'AFRICA',
      label: 'Africa',
      color: 'blue',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyLocationContinent
        .antarctica,
      value: 'ANTARCTICA',
      label: 'Antarctica',
      color: 'red',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyLocationContinent.asia,
      value: 'ASIA',
      label: 'Asia',
      color: 'green',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyLocationContinent
        .europe,
      value: 'EUROPE',
      label: 'Europe',
      color: 'orange',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyLocationContinent
        .northAmerica,
      value: 'NORTH_AMERICA',
      label: 'North America',
      color: 'purple',
      position: 4,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyLocationContinent
        .oceania,
      value: 'OCEANIA',
      label: 'Oceania',
      color: 'yellow',
      position: 5,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyLocationContinent
        .southAmerica,
      value: 'SOUTH_AMERICA',
      label: 'South America',
      color: 'pink',
      position: 6,
    },
  ],
});
