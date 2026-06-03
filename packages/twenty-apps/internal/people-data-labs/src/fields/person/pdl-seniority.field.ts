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
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlSeniority,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlSeniority',
  label: 'Seniority',
  description: 'Highest People Data Labs canonical job title level.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.cxo,
      value: 'CXO',
      label: 'CXO',
      color: 'purple',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.owner,
      value: 'OWNER',
      label: 'Owner',
      color: 'pink',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.vp,
      value: 'VP',
      label: 'VP',
      color: 'blue',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.director,
      value: 'DIRECTOR',
      label: 'Director',
      color: 'sky',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.partner,
      value: 'PARTNER',
      label: 'Partner',
      color: 'turquoise',
      position: 4,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.senior,
      value: 'SENIOR',
      label: 'Senior',
      color: 'green',
      position: 5,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.manager,
      value: 'MANAGER',
      label: 'Manager',
      color: 'yellow',
      position: 6,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.entry,
      value: 'ENTRY',
      label: 'Entry',
      color: 'orange',
      position: 7,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.training,
      value: 'TRAINING',
      label: 'Training',
      color: 'gray',
      position: 8,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.unpaid,
      value: 'UNPAID',
      label: 'Unpaid',
      color: 'red',
      position: 9,
    },
  ],
});
