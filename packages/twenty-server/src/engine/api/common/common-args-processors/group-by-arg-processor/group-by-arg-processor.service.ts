import { Injectable } from '@nestjs/common';
import {
  ObjectRecordGroupByForAtomicField,
  ObjectRecordGroupByForCompositeField,
  ObjectRecordGroupByForDateField,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

@Injectable()
export class GroupByArgProcessorService {
  process({
    groupBy,
  }: {
    groupBy:
      | ObjectRecordGroupByForAtomicField
      | ObjectRecordGroupByForCompositeField
      | ObjectRecordGroupByForDateField
      | Array<
          | ObjectRecordGroupByForAtomicField
          | ObjectRecordGroupByForCompositeField
          | ObjectRecordGroupByForDateField
        >;
  }): Array<
    | ObjectRecordGroupByForAtomicField
    | ObjectRecordGroupByForCompositeField
    | ObjectRecordGroupByForDateField
  > {
    if (Array.isArray(groupBy)) {
      return groupBy;
    }

    return [groupBy];
  }
}
