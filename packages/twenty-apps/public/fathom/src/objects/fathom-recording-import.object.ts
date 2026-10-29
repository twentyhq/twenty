import {
  defineObject,
  FieldType,
  MetadataWritability,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CALL_RECORDING_ON_FATHOM_RECORDING_IMPORT_FIELD_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_ID_FIELD_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_IMPORT_CONNECTED_ACCOUNT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_IMPORT_MEDIA_CLAIMED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_IMPORT_MEDIA_DOWNLOAD_ID_FIELD_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_IMPORT_MEDIA_FAILURE_REASON_FIELD_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_IMPORT_MEDIA_UPLOAD_CHECKPOINT_FIELD_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_IMPORT_OBJECT_UNIVERSAL_IDENTIFIER,
  FATHOM_RECORDING_IMPORTS_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: FATHOM_RECORDING_IMPORT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'fathomRecordingImport',
  namePlural: 'fathomRecordingImports',
  labelSingular: 'Fathom Recording Import',
  labelPlural: 'Fathom Recording Imports',
  description:
    'Internal state for importing one Fathom recording into a call recording.',
  icon: 'IconDownload',
  writability: MetadataWritability.APPLICATION,
  isUICreatable: false,
  isUIEditable: false,
  isSearchable: false,
  labelIdentifierFieldMetadataUniversalIdentifier:
    FATHOM_RECORDING_ID_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: FATHOM_RECORDING_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'recordingId',
      label: 'Fathom Recording ID',
      description: 'Recording identifier assigned by Fathom.',
      icon: 'IconHash',
      isUnique: true,
    },
    {
      universalIdentifier:
        FATHOM_RECORDING_IMPORT_CONNECTED_ACCOUNT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'connectedAccountId',
      label: 'Connected Account ID',
      description:
        'Connected account that owns the private Fathom download.',
      icon: 'IconLink',
      isNullable: true,
    },
    {
      universalIdentifier:
        FATHOM_RECORDING_IMPORT_MEDIA_DOWNLOAD_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'mediaDownloadId',
      label: 'Media Download ID',
      description: 'Active asynchronous Fathom media download.',
      icon: 'IconDownload',
      isNullable: true,
    },
    {
      universalIdentifier:
        FATHOM_RECORDING_IMPORT_MEDIA_FAILURE_REASON_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'mediaFailureReason',
      label: 'Media Failure Reason',
      description: 'Why Fathom could not supply video or audio.',
      icon: 'IconAlertTriangle',
      isNullable: true,
    },
    {
      universalIdentifier:
        FATHOM_RECORDING_IMPORT_MEDIA_CLAIMED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'mediaImportClaimedAt',
      label: 'Media Import Claimed At',
      description:
        'Expiring lease held by the worker importing Fathom media.',
      icon: 'IconLock',
      isNullable: true,
    },
    {
      universalIdentifier:
        FATHOM_RECORDING_IMPORT_MEDIA_UPLOAD_CHECKPOINT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RAW_JSON,
      name: 'mediaUploadCheckpoint',
      label: 'Media Upload Checkpoint',
      description: 'Completed upload awaiting attachment to the call recording.',
      icon: 'IconUpload',
      isNullable: true,
    },
    {
      universalIdentifier:
        CALL_RECORDING_ON_FATHOM_RECORDING_IMPORT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'callRecording',
      label: 'Call Recording',
      description: 'Call recording produced by this Fathom import.',
      icon: 'IconMicrophone',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording
          .universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        FATHOM_RECORDING_IMPORTS_ON_CALL_RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: 'callRecordingId',
      },
    },
  ],
});
