import {
  RecordPositionQueryFactory,
  RecordPositionQueryType,
} from 'src/engine/api/graphql/workspace-query-builder/factories/record-position-query.factory';

describe('RecordPositionQueryFactory', () => {
  const objectMetadataItem = {
    isCustom: false,
    nameSingular: 'company',
  };
  const dataSourceSchema = 'workspace_test';
  const factory: RecordPositionQueryFactory = new RecordPositionQueryFactory();

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('create', () => {
    describe('createForGet', () => {
      it('should return a string with the position when positionValue is first', async () => {
        const positionValue = 'first';

        const result = await factory.create(
          RecordPositionQueryType.GET,
          positionValue,
          objectMetadataItem,
          dataSourceSchema,
        );

        expect(result).toEqual(
          `SELECT position FROM workspace_test."company"
            WHERE "position" IS NOT NULL ORDER BY "position" ASC LIMIT 1`,
        );
      });

      it('should return a string with the position when positionValue is last', async () => {
        const positionValue = 'last';

        const result = await factory.create(
          RecordPositionQueryType.GET,
          positionValue,
          objectMetadataItem,
          dataSourceSchema,
        );

        expect(result).toEqual(
          `SELECT position FROM workspace_test."company"
            WHERE "position" IS NOT NULL ORDER BY "position" DESC LIMIT 1`,
        );
      });
    });

    it('should return a string with the position when positionValue is a number', async () => {
      const positionValue = 1;

      try {
        await factory.create(
          RecordPositionQueryType.GET,
          positionValue,
          objectMetadataItem,
          dataSourceSchema,
        );
      } catch (error) {
        expect(error.message).toEqual(
          'RecordPositionQueryType.GET requires positionValue to be a number',
        );
      }
    });
  });

  describe('createForUpdate', () => {
    it('should return a string when RecordPositionQueryType is UPDATE', async () => {
      const positionValue = 1;

      const result = await factory.create(
        RecordPositionQueryType.UPDATE,
        positionValue,
        objectMetadataItem,
        dataSourceSchema,
      );

      expect(result).toEqual(
        `UPDATE workspace_test."company"
            SET "position" = $1
            WHERE "id" = $2`,
      );
    });
  });
});
