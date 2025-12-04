// Shared schema generators for record CRUD operations
// Used by both AI chat tools (ToolService) and workflow step configurators

export { generateCreateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-record-input-schema.util';
export { generateUpdateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-update-record-input-schema.util';
export { generateFindToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-tool.zod-schema';
export { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';
export { SoftDeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/soft-delete-tool.zod-schema';
export { FindOneToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-one-tool.zod-schema';
export { BulkDeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/bulk-delete-tool.zod-schema';

export type { ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
