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
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlCompanyType,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlCompanyType',
  label: 'Company Type',
  description: 'People Data Labs canonical company type.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyType.public,
      value: 'PUBLIC',
      label: 'Public',
      color: 'blue',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyType.private,
      value: 'PRIVATE',
      label: 'Private',
      color: 'red',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyType.publicSubsidiary,
      value: 'PUBLIC_SUBSIDIARY',
      label: 'Public Subsidiary',
      color: 'green',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyType.educational,
      value: 'EDUCATIONAL',
      label: 'Educational',
      color: 'orange',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyType.government,
      value: 'GOVERNMENT',
      label: 'Government',
      color: 'purple',
      position: 4,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyType.nonprofit,
      value: 'NONPROFIT',
      label: 'Nonprofit',
      color: 'yellow',
      position: 5,
    },
  ],
});
