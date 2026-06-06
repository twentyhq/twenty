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
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlSex,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlSex',
  label: 'Sex',
  description: 'Sex returned by People Data Labs.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.sex.male,
      value: 'MALE',
      label: 'Male',
      color: 'blue',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.sex.female,
      value: 'FEMALE',
      label: 'Female',
      color: 'red',
      position: 1,
    },
  ],
});
