import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import {
  ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { checkFields } from 'src/engine/api/rest/core/query-builder/utils/check-fields.utils';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const DEFAULT_ORDER_DIRECTION = OrderByDirection.AscNullsFirst;

@Injectable()
export class OrderByInputFactory {
  create(
    request: Request,
    objectMetadata: {
      objectMetadataMaps: ObjectMetadataMaps;
      objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
    },
  ): ObjectRecordOrderBy {
    const orderByQuery = request.query.order_by;

    if (typeof orderByQuery !== 'string') {
      return this.addDefaultOrderById([{}]);
    }

    //orderByQuery = field_1[AscNullsFirst],field_2[DescNullsLast],field_3
    const orderByItems = orderByQuery.split(',');
    let result: Array<Record<string, OrderByDirection>> = [];
    let itemDirection = '';
    let itemFields = '';

    for (const orderByItem of orderByItems) {
      // orderByItem -> field_1[AscNullsFirst]
      if (orderByItem.includes('[') && orderByItem.includes(']')) {
        const [fieldsString, direction] = orderByItem
          .replace(']', '')
          .split('[');

        // fields -> [field_1] ; direction -> AscNullsFirst
        if (!(direction in OrderByDirection)) {
          throw new BadRequestException(
            `'order_by' direction '${direction}' invalid. Allowed values are '${Object.values(
              OrderByDirection,
            ).join(
              "', '",
            )}'. eg: ?order_by=field_1[AscNullsFirst],field_2[DescNullsLast],field_3`,
          );
        }

        itemDirection = direction;
        itemFields = fieldsString;
      } else {
        // orderByItem -> field_3
        itemDirection = DEFAULT_ORDER_DIRECTION;
        itemFields = orderByItem;
      }

      let fieldResult = {};

      itemFields
        .split('.')
        .reverse()
        .forEach((field) => {
          if (Object.keys(fieldResult).length) {
            fieldResult = { [field]: fieldResult };
          } else {
            // @ts-expect-error legacy noImplicitAny
            fieldResult[field] = itemDirection;
          }
        }, itemDirection);

      const resultFields = Object.keys(fieldResult).map((key) => ({
        // @ts-expect-error legacy noImplicitAny
        [key]: fieldResult[key],
      }));

      result = [...result, ...resultFields];
    }

    checkFields(
      objectMetadata.objectMetadataMapItem,
      result.flatMap((fields) => Object.keys(fields)),
    );

    return this.addDefaultOrderById(result);
  }

  addDefaultOrderById(orderBy: ObjectRecordOrderBy) {
    const hasIdOrder = orderBy.some((o) => Object.keys(o).includes('id'));

    return hasIdOrder
      ? orderBy
      : [...orderBy, { id: OrderByDirection.AscNullsFirst }];
  }
}
