import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';

import { RichTextV2FieldQueryResultGetterHandler } from 'src/engine/api/common/common-result-getters/handlers/field-handlers/rich-text-v2-field-query-result-getter.handler';
import { type FileService } from 'src/engine/core-modules/file/services/file.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const baseRecord: ObjectRecord = {
  id: '1',
  createdAt: '2021-01-01',
  updatedAt: '2021-01-01',
  deletedAt: null,
};

const richTextFieldMetadata = [
  {
    type: FieldMetadataType.RICH_TEXT_V2,
    name: 'bodyV2',
  },
] as FlatFieldMetadata[];

const mockFileService = {
  signFileUrl: jest.fn().mockReturnValue('signed-path'),
} as unknown as FileService;

describe('RichTextV2FieldQueryResultGetterHandler', () => {
  let handler: RichTextV2FieldQueryResultGetterHandler;

  beforeEach(() => {
    process.env.SERVER_URL = 'https://my-domain.twenty.com';
    handler = new RichTextV2FieldQueryResultGetterHandler(mockFileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.SERVER_URL;
  });

  describe('should return record unchanged', () => {
    it('when no RICH_TEXT_V2 field metadata is present', async () => {
      const record = {
        ...baseRecord,
        bodyV2: { blocknote: '[]', markdown: null },
      };

      const result = await handler.handle(record, 'ws-1', []);

      expect(result).toEqual(record);
    });

    it('when blocknote is null', async () => {
      const record = {
        ...baseRecord,
        bodyV2: { blocknote: null, markdown: null },
      };

      const result = await handler.handle(
        record,
        'ws-1',
        richTextFieldMetadata,
      );

      expect(result).toEqual(record);
    });

    it('when blocknote is not a string', async () => {
      const record = {
        ...baseRecord,
        bodyV2: { blocknote: 123, markdown: null },
      };

      const result = await handler.handle(
        record,
        'ws-1',
        richTextFieldMetadata,
      );

      expect(result).toEqual(record);
    });

    it('when blocknote is an invalid JSON string', async () => {
      const record = {
        ...baseRecord,
        bodyV2: { blocknote: 'not-json', markdown: null },
      };

      const result = await handler.handle(
        record,
        'ws-1',
        richTextFieldMetadata,
      );

      expect(result).toEqual(record);
    });

    it('when blocknote parses to a non-array value', async () => {
      const record = {
        ...baseRecord,
        bodyV2: { blocknote: '{}', markdown: null },
      };

      const result = await handler.handle(
        record,
        'ws-1',
        richTextFieldMetadata,
      );

      expect(result).toEqual(record);
    });

    it('when blocknote has no image blocks', async () => {
      const record = {
        ...baseRecord,
        bodyV2: {
          markdown: null,
          blocknote: JSON.stringify([
            { type: 'paragraph', text: 'Hello, world!' },
          ]),
        },
      };

      const result = await handler.handle(
        record,
        'ws-1',
        richTextFieldMetadata,
      );

      expect(result).toEqual(record);
    });

    it('when image block has external URL', async () => {
      const record = {
        ...baseRecord,
        bodyV2: {
          markdown: null,
          blocknote: JSON.stringify([
            {
              type: 'image',
              props: { url: 'https://external.com/image.jpg' },
            },
          ]),
        },
      };

      const result = await handler.handle(
        record,
        'ws-1',
        richTextFieldMetadata,
      );

      expect(result).toEqual(record);
    });
  });

  describe('should sign internal image URLs', () => {
    it('when image block has an internal attachment URL', async () => {
      const imageBlock = {
        type: 'image',
        props: {
          name: 'photo.jpg',
          url: 'https://my-domain.twenty.com/files/attachment/some-token/photo.jpg',
          caption: '',
        },
        children: [],
      };

      const record = {
        ...baseRecord,
        bodyV2: {
          markdown: null,
          blocknote: JSON.stringify([imageBlock]),
        },
      };

      const result = await handler.handle(
        record,
        'ws-1',
        richTextFieldMetadata,
      );

      expect(result).toEqual({
        ...baseRecord,
        bodyV2: {
          markdown: null,
          blocknote: JSON.stringify([
            {
              ...imageBlock,
              props: {
                ...imageBlock.props,
                url: 'https://my-domain.twenty.com/files/signed-path',
              },
            },
          ]),
        },
      });
    });
  });

  describe('should handle multiple RICH_TEXT_V2 fields', () => {
    it('when record has multiple rich text fields', async () => {
      const multiFieldMetadata = [
        { type: FieldMetadataType.RICH_TEXT_V2, name: 'bodyV2' },
        { type: FieldMetadataType.RICH_TEXT_V2, name: 'description' },
      ] as FlatFieldMetadata[];

      const record = {
        ...baseRecord,
        bodyV2: {
          markdown: null,
          blocknote: JSON.stringify([{ type: 'paragraph', text: 'Hello' }]),
        },
        description: {
          markdown: null,
          blocknote: '{}',
        },
      };

      const result = await handler.handle(record, 'ws-1', multiFieldMetadata);

      // bodyV2 should be unchanged (no images), description should be
      // unchanged (non-array blocknote)
      expect(result).toEqual(record);
    });
  });
});
