import { StartingAfterInputFactory } from 'src/engine/api/rest/input-factories/starting-after-input.factory';
import { EndingBeforeInputFactory } from 'src/engine/api/rest/input-factories/ending-before-input.factory';
import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';
import { OrderByInputFactory } from 'src/engine/api/rest/input-factories/order-by-input.factory';
import { FilterInputFactory } from 'src/engine/api/rest/input-factories/filter-input.factory';
import { DepthInputFactory } from 'src/engine/api/rest/input-factories/depth-input.factory';

export const inputFactories = [
  DepthInputFactory,
  EndingBeforeInputFactory,
  FilterInputFactory,
  LimitInputFactory,
  OrderByInputFactory,
  StartingAfterInputFactory,
];
