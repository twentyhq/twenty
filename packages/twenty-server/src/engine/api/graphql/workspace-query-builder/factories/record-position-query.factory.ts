import { Injectable } from '@nestjs/common';

export enum RecordPositionQueryType {
  GET = 'GET',
  UPDATE = 'UPDATE',
}

@Injectable()
export class RecordPositionQueryFactory {
  async create(
    recordPositionQueryType: RecordPositionQueryType,
    positionValue: 'first' | 'last' | number,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    dataSourceSchema: string,
  ): Promise<string> {
    const name =
      (objectMetadata.isCustom ? '_' : '') + objectMetadata.nameSingular;

    switch (recordPositionQueryType) {
      case RecordPositionQueryType.GET:
        if (typeof positionValue === 'number') {
          throw new Error(
            'RecordPositionQueryType.GET requires positionValue to be a number',
          );
        }

        return this.createForGet(positionValue, name, dataSourceSchema);
      case RecordPositionQueryType.UPDATE:
        return this.createForUpdate(name, dataSourceSchema);
      default:
        throw new Error('Invalid RecordPositionQueryType');
    }
  }

  private async createForGet(
    positionValue: 'first' | 'last',
    name: string,
    dataSourceSchema: string,
  ): Promise<string> {
    const orderByDirection = positionValue === 'first' ? 'ASC' : 'DESC';

    return `SELECT position FROM ${dataSourceSchema}."${name}"
            WHERE "position" IS NOT NULL ORDER BY "position" ${orderByDirection} LIMIT 1`;
  }

  private async createForUpdate(
    name: string,
    dataSourceSchema: string,
  ): Promise<string> {
    return `UPDATE ${dataSourceSchema}."${name}"
            SET "position" = $1
            WHERE "id" = $2`;
  }
}
