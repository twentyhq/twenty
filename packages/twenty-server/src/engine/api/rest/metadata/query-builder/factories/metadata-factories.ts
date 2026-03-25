import { CreateMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/create-metadata-query.factory';
import { DeleteMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/delete-metadata-query.factory';
import { FindManyMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/find-many-metadata-query.factory';
import { FindOneMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/find-one-metadata-query.factory';
import { GetMetadataVariablesFactory } from 'src/engine/api/rest/metadata/query-builder/factories/get-metadata-variables.factory';
import { UpdateMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/update-metadata-query.factory';

export const metadataQueryBuilderFactories = [
  FindOneMetadataQueryFactory,
  FindManyMetadataQueryFactory,
  CreateMetadataQueryFactory,
  DeleteMetadataQueryFactory,
  UpdateMetadataQueryFactory,
  GetMetadataVariablesFactory,
];
