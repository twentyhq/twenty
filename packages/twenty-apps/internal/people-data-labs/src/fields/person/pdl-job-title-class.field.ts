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
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlJobTitleClass,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlJobTitleClass',
  label: 'Job Class',
  description: 'People Data Labs canonical job class.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobClass
        .generalAndAdministrative,
      value: 'GENERAL_AND_ADMINISTRATIVE',
      label: 'General and Administrative',
      color: 'blue',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobClass
        .researchAndDevelopment,
      value: 'RESEARCH_AND_DEVELOPMENT',
      label: 'Research and Development',
      color: 'red',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobClass
        .salesAndMarketing,
      value: 'SALES_AND_MARKETING',
      label: 'Sales and Marketing',
      color: 'green',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobClass.services,
      value: 'SERVICES',
      label: 'Services',
      color: 'orange',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobClass.unemployed,
      value: 'UNEMPLOYED',
      label: 'Unemployed',
      color: 'purple',
      position: 4,
    },
  ],
});
