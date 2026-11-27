import {
  frontComponentHostCommunicationApi,
  type GetObjectMetadataFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const getObjectMetadata: GetObjectMetadataFunction = async (
  objectNameSingular,
) =>
  frontComponentHostCommunicationApi.getObjectMetadata?.(objectNameSingular) ??
  null;
