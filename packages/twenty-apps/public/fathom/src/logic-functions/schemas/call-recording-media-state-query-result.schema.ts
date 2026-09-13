import { z } from 'zod';

import { fathomMediaKindSchema } from 'src/logic-functions/schemas/fathom-media-kind.schema';

const fileSchema = z.object({
  fileId: z.string().nullable().optional(),
});

export const fathomMediaUploadCheckpointSchema = z.object({
  downloadId: z.string().trim().min(1),
  fileId: z.string().trim().min(1),
  kind: fathomMediaKindSchema,
});

const fathomRecordingImportSchema = z.object({
  id: z.string(),
  updatedAt: z.string(),
  recordingId: z.string().nullable().optional(),
  connectedAccountId: z.string().nullable().optional(),
  mediaDownloadId: z.string().nullable().optional(),
  mediaFailureReason: z.string().nullable().optional(),
  mediaImportClaimedAt: z.string().nullable().optional(),
  mediaUploadCheckpoint: z.unknown().nullable().optional(),
});

const fathomRecordingImportsConnectionSchema = z
  .object({
    edges: z.array(
      z
        .object({
          node: fathomRecordingImportSchema.nullable().optional(),
        })
        .nullable(),
    ),
  })
  .nullable()
  .optional();

export const callRecordingMediaStateNodeSchema = z.object({
  id: z.string(),
  updatedAt: z.string(),
  video: z.array(fileSchema).nullable().optional(),
  audio: z.array(fileSchema).nullable().optional(),
  fathomRecordingImports: fathomRecordingImportsConnectionSchema,
  transcript: z.unknown().nullable().optional(),
  summary: z
    .object({
      markdown: z.string().nullable().optional(),
      blocknote: z.unknown().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const callRecordingMediaStateQueryResultSchema = z.object({
  callRecordings: z
    .object({
      edges: z.array(
        z
          .object({
            node: callRecordingMediaStateNodeSchema.nullable().optional(),
          })
          .nullable(),
      ),
    })
    .nullable()
    .optional(),
});
