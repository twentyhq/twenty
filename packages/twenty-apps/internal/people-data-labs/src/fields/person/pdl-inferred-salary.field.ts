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
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlInferredSalary,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlInferredSalary',
  label: 'Inferred Salary (range)',
  description: 'People Data Labs canonical inferred salary range.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .under20000,
      value: 'UNDER_20000',
      label: '<20,000',
      color: 'blue',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .from20000To25000,
      value: 'FROM_20000_TO_25000',
      label: '20,000-25,000',
      color: 'red',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .from25000To35000,
      value: 'FROM_25000_TO_35000',
      label: '25,000-35,000',
      color: 'green',
      position: 2,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .from35000To45000,
      value: 'FROM_35000_TO_45000',
      label: '35,000-45,000',
      color: 'orange',
      position: 3,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .from45000To55000,
      value: 'FROM_45000_TO_55000',
      label: '45,000-55,000',
      color: 'purple',
      position: 4,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .from55000To70000,
      value: 'FROM_55000_TO_70000',
      label: '55,000-70,000',
      color: 'yellow',
      position: 5,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .from70000To85000,
      value: 'FROM_70000_TO_85000',
      label: '70,000-85,000',
      color: 'pink',
      position: 6,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .from85000To100000,
      value: 'FROM_85000_TO_100000',
      label: '85,000-100,000',
      color: 'cyan',
      position: 7,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .from100000To150000,
      value: 'FROM_100000_TO_150000',
      label: '100,000-150,000',
      color: 'brown',
      position: 8,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .from150000To250000,
      value: 'FROM_150000_TO_250000',
      label: '150,000-250,000',
      color: 'lime',
      position: 9,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personInferredSalary
        .over250000,
      value: 'OVER_250000',
      label: '>250,000',
      color: 'violet',
      position: 10,
    },
  ],
});
