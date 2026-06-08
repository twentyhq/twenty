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
  type: FieldType.MULTI_SELECT,
  name: 'pdlSeniority',
  label: 'Seniority',
  description: 'People Data Labs canonical job title levels.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.cxo,
      value: 'CXO',
      label: 'CXO',
      color: 'blue',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.owner,
      value: 'OWNER',
      label: 'Owner',
      color: 'red',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.vp,
      value: 'VP',
      label: 'VP',
      color: 'green',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.director,
      value: 'DIRECTOR',
      label: 'Director',
      color: 'orange',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.partner,
      value: 'PARTNER',
      label: 'Partner',
      color: 'purple',
      position: 4,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.senior,
      value: 'SENIOR',
      label: 'Senior',
      color: 'yellow',
      position: 5,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.manager,
      value: 'MANAGER',
      label: 'Manager',
      color: 'pink',
      position: 6,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.entry,
      value: 'ENTRY',
      label: 'Entry',
      color: 'cyan',
      position: 7,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.training,
      value: 'TRAINING',
      label: 'Training',
      color: 'brown',
      position: 8,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.seniority.unpaid,
      value: 'UNPAID',
      label: 'Unpaid',
      color: 'lime',
      position: 9,
    },
  ],
});
