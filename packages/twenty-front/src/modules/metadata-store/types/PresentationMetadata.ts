import {
  type PresentationMetadata as GeneratedPresentationMetadata,
  type PresentationObjectMetadata as GeneratedPresentationObjectMetadata,
  type PresentationView as GeneratedPresentationView,
} from '~/generated-metadata/graphql';

export type PresentationObjectMetadata = GeneratedPresentationObjectMetadata;
export type PresentationView = GeneratedPresentationView;
export type PresentationMetadata = GeneratedPresentationMetadata;

export type FindPresentationMetadataQuery = {
  presentationMetadata: PresentationMetadata;
};
