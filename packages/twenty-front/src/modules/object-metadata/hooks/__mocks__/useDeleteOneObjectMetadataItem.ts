import { gql } from '@apollo/client';
import {
  MetadataReadability,
  ObjectOpenRecordIn,
  ObjectSharingReach,
} from 'twenty-shared/types';

export const query = gql`
  mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {
    deleteOneObject(input: { id: $idToDelete }) {
      id
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      color
      isActive
      isSearchable
      openRecordIn
      sharingReach
      readability
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
      applicationId
    }
  }
`;

export const variables = { idToDelete: 'idToDelete' };

export const responseData = {
  id: '',
  nameSingular: '',
  namePlural: '',
  labelSingular: '',
  labelPlural: '',
  description: '',
  icon: '',
  color: null,
  isActive: true,
  isSearchable: false,
  openRecordIn: ObjectOpenRecordIn.USER_CHOICE,
  sharingReach: ObjectSharingReach.WORKSPACE,
  readability: MetadataReadability.OPEN,
  createdAt: '',
  updatedAt: '',
  labelIdentifierFieldMetadataId: '20202020-72ba-4e11-a36d-e17b544541e1',
  imageIdentifierFieldMetadataId: '',
  applicationId: null,
};
