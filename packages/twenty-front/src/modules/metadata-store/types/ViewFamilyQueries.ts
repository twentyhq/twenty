import { type FindAllViewsQuery } from '~/generated-metadata/graphql';

export type ViewFamilyResponse = {
  familyVersion: string;
  views: FindAllViewsQuery['getViews'];
};

export type FindSharedViewsQuery = {
  getSharedViews: ViewFamilyResponse;
};

export type FindMyPrivateViewsQuery = {
  getMyPrivateViews: ViewFamilyResponse;
};
