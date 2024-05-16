import { DeleteQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/delete-query.factory';
import { CreateOneQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/create-one-query.factory';
import { UpdateQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/update-query.factory';
import { FindOneQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/find-one-query.factory';
import { FindManyQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/find-many-query.factory';
import { DeleteVariablesFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/delete-variables.factory';
import { CreateVariablesFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/create-variables.factory';
import { UpdateVariablesFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/update-variables.factory';
import { GetVariablesFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/get-variables.factory';
import { LastCursorInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/last-cursor-input.factory';
import { LimitInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/limit-input.factory';
import { OrderByInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/order-by-input.factory';
import { FilterInputFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/input-factories/filter-input.factory';
import { CreateManyQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/create-many-query.factory';

export const coreQueryBuilderFactories = [
  DeleteQueryFactory,
  CreateOneQueryFactory,
  CreateManyQueryFactory,
  UpdateQueryFactory,
  FindOneQueryFactory,
  FindManyQueryFactory,
  DeleteVariablesFactory,
  CreateVariablesFactory,
  UpdateVariablesFactory,
  GetVariablesFactory,
  LastCursorInputFactory,
  LimitInputFactory,
  OrderByInputFactory,
  FilterInputFactory,
];
