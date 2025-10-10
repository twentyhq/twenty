import { CreateManyQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/create-many-query.factory';
import { CreateVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/create-variables.factory';
import { FindDuplicatesQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/find-duplicates-query.factory';
import { FindDuplicatesVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/find-duplicates-variables.factory';
import { GetVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/get-variables.factory';
import { inputFactories } from 'src/engine/api/rest/input-factories/factories';

export const coreQueryBuilderFactories = [
  CreateManyQueryFactory,
  FindDuplicatesQueryFactory,
  CreateVariablesFactory,
  GetVariablesFactory,
  FindDuplicatesVariablesFactory,
  ...inputFactories,
];
