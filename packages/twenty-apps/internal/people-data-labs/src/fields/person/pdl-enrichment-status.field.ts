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
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlEnrichmentStatus,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlEnrichmentStatus',
  label: 'Enrichment Status',
  description: 'Outcome of the latest People Data Labs enrichment attempt.',
  isNullable: true,
  options: [
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personEnrichmentStatus
        .matched,
      value: 'MATCHED',
      label: 'Matched',
      color: 'green',
      position: 0,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personEnrichmentStatus
        .notFound,
      value: 'NOT_FOUND',
      label: 'No Match',
      color: 'gray',
      position: 1,
    },
    {
      id: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personEnrichmentStatus.error,
      value: 'ERROR',
      label: 'Error',
      color: 'red',
      position: 2,
    },
  ],
});
