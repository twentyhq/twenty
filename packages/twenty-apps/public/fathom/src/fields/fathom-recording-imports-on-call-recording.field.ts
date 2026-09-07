import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CALL_RECORDING_ON_FATHOM_RECORDING_IMPORT_FIELD_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_IMPORT_OBJECT_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_IMPORTS_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    FATHOM_RECORDING_IMPORTS_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.RELATION,
  name: 'fathomRecordingImports',
  label: 'Fathom Recording Imports',
  description: 'Internal Fathom import state associated with this recording.',
  icon: 'IconDownload',
  isNullable: true,
  isUIEditable: false,
  relationTargetObjectMetadataUniversalIdentifier:
    FATHOM_RECORDING_IMPORT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    CALL_RECORDING_ON_FATHOM_RECORDING_IMPORT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
