import {
  type MinimalMetadata as GeneratedMinimalMetadata,
  type MinimalObjectMetadata as GeneratedMinimalObjectMetadata,
  type MinimalView as GeneratedMinimalView,
} from '~/generated-metadata/graphql';

export type MinimalObjectMetadata = GeneratedMinimalObjectMetadata;

export type MinimalView = GeneratedMinimalView;

export type MinimalMetadata = GeneratedMinimalMetadata;

export type FindMinimalMetadataQuery = {
  minimalMetadata: MinimalMetadata;
};
