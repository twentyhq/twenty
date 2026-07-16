import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from './executive-profile.object';

enum ArtifactType {
  BOARD_BIO = 'BOARD_BIO',
  ELEVATOR_PITCH = 'ELEVATOR_PITCH',
  IMPACT_REPORT = 'IMPACT_REPORT',
  EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY',
  REFERENCE_LETTER = 'REFERENCE_LETTER',
  PRESS_RELEASE = 'PRESS_RELEASE',
  INTERNAL_ASSESSMENT = 'INTERNAL_ASSESSMENT',
  OTHER = 'OTHER',
}

enum ArtifactVisibility {
  INTERNAL = 'Internal',
  CLIENT = 'Client',
  PUBLIC = 'Public',
}

export const EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER =
  '6d8552c3-c284-4956-be52-aa4c453eb846';

export const EXECUTIVE_ARTIFACT_EP_RELATION_UNIVERSAL_IDENTIFIER =
  '0fb5205b-cc2e-4bc7-88bb-977df6c6d381';

export const EXECUTIVE_ARTIFACT_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  'ae606ab6-42d7-48b6-88c7-09a8164b6698';

export const EXECUTIVE_ARTIFACT_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  'b0be6b54-8dd5-4519-830a-e9e4155f4c07';

export const EXECUTIVE_ARTIFACT_VISIBILITY_FIELD_UNIVERSAL_IDENTIFIER =
  'b9bb71a0-498c-4de8-8aea-bb737e528012';

export default defineObject({
  universalIdentifier: EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveArtifact',
  namePlural: 'executiveArtifacts',
  labelSingular: 'Artifact',
  labelPlural: 'Artifacts',
  description:
    'A secure document artifact associated with an executive profile (board bio, elevator pitch, impact report, etc.).',
  icon: 'IconFile',
  labelIdentifierFieldMetadataUniversalIdentifier:
    EXECUTIVE_ARTIFACT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    // MANY_TO_ONE to executiveProfile
    {
      universalIdentifier:
        EXECUTIVE_ARTIFACT_EP_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'executiveProfile',
      label: 'Executive Profile',
      description: 'The parent executive profile.',
      relationTargetObjectMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_ARTIFACT_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier:
        EXECUTIVE_ARTIFACT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Type',
      description: 'Classification of the artifact.',
      icon: 'IconCategory',
      options: [
        {
          id: '3f3b2410-c7c5-4e51-9260-ec9a1e697508',
          value: ArtifactType.BOARD_BIO,
          label: 'Board Bio',
          position: 0,
          color: 'blue',
        },
        {
          id: '0da30431-2280-4e5c-b82b-25d50218312e',
          value: ArtifactType.ELEVATOR_PITCH,
          label: 'Elevator Pitch',
          position: 1,
          color: 'purple',
        },
        {
          id: '33ef606d-343e-4e01-9c46-dd681eeb3a8f',
          value: ArtifactType.IMPACT_REPORT,
          label: 'Impact Report',
          position: 2,
          color: 'green',
        },
        {
          id: 'b84b2f3d-3e56-4e68-9986-36f8c3501d08',
          value: ArtifactType.EXECUTIVE_SUMMARY,
          label: 'Executive Summary',
          position: 3,
          color: 'yellow',
        },
        {
          id: 'd61f2b48-e2a9-43ef-8149-512afc62d379',
          value: ArtifactType.REFERENCE_LETTER,
          label: 'Reference Letter',
          position: 4,
          color: 'orange',
        },
        {
          id: '8ec7eea3-e743-4dbc-9b0c-9d9e30860aba',
          value: ArtifactType.PRESS_RELEASE,
          label: 'Press Release',
          position: 5,
          color: 'red',
        },
        {
          id: '32962e45-57ca-4a32-ab12-902eb9980cfd',
          value: ArtifactType.INTERNAL_ASSESSMENT,
          label: 'Internal Assessment',
          position: 6,
          color: 'gray',
        },
        {
          id: 'bc2f1f55-5a7f-4bbb-ae61-34a14ed79ce8',
          value: ArtifactType.OTHER,
          label: 'Other',
          position: 7,
          color: 'grey',
        },
      ],
      name: 'type',
    },
    {
      universalIdentifier: '05b23a95-2ba7-40cd-b407-3a252811e031',
      type: FieldType.TEXT,
      label: 'File Reference',
      description: 'Secure reference pointer to the artifact file.',
      icon: 'IconPaperclip',
      name: 'fileRef',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'c0774d1b-7c29-4d5a-96c6-da370eb705eb',
      type: FieldType.TEXT,
      label: 'Version',
      description: 'Version identifier for the artifact.',
      icon: 'IconVersions',
      name: 'version',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_ARTIFACT_VISIBILITY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Visibility',
      description: 'Who can access this artifact.',
      icon: 'IconEye',
      options: [
        {
          id: '4635525b-9259-4523-9c4d-14eb62981c1f',
          value: ArtifactVisibility.INTERNAL,
          label: 'Internal',
          position: 0,
          color: 'gray',
        },
        {
          id: 'a266758c-9f90-41d0-801b-36bb96a7beb0',
          value: ArtifactVisibility.CLIENT,
          label: 'Client',
          position: 1,
          color: 'blue',
        },
        {
          id: 'ad9e5e8a-5250-4b4b-8e60-783c9a0bad41',
          value: ArtifactVisibility.PUBLIC,
          label: 'Public',
          position: 2,
          color: 'green',
        },
      ],
      name: 'visibility',
      defaultValue: `'${ArtifactVisibility.INTERNAL}'`,
    },
    {
      universalIdentifier: 'be8d032b-e2ac-437c-b790-ef66374d97ea',
      type: FieldType.TEXT,
      label: 'Source Hash',
      description: 'Content hash from the source system.',
      icon: 'IconHash',
      name: 'sourceHash',
      isNullable: true,
      defaultValue: null,
    },
  ],
  indexes: [
    {
      universalIdentifier: 'b1d99122-306a-48f5-a61b-7e57cdb4b5cb',
      objectUniversalIdentifier: EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveArtifact_executiveProfileId',
      fields: [
        {
          universalIdentifier: '67f70163-9eb7-480a-afc1-a7f8b03a4ab1',
          fieldName: 'executiveProfile',
        },
      ],
    },
  ],
});
