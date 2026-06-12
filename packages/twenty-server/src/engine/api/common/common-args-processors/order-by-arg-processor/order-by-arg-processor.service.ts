import { Injectable } from '@nestjs/common';
import { ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import {
  ObjectRecordOrderByForCompositeField,
  ObjectRecordOrderByForScalarField,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class OrderByArgProcessorService {
  process({
    orderBy,
  }: {
    orderBy:
      | undefined
      | ObjectRecordOrderByForScalarField
      | ObjectRecordOrderByForCompositeField
      | ObjectRecordOrderBy;
  }): ObjectRecordOrderBy | undefined {
    if (Array.isArray(orderBy) || !isDefined(orderBy)) {
      return orderBy;
    }

    return [orderBy];
  }
}
