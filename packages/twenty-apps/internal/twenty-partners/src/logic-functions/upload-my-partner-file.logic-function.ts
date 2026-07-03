import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { z } from 'zod';

import {
  COVER_IMAGE_FIELD_ID,
  PROFILE_PICTURE_FILE_FIELD_ID,
} from 'src/constants/my-profile.constants';

import { buildAppClient, errorResponse, resolvePartnerFromRequest } from './resolve-partner-from-request';

export const UPLOAD_MY_PARTNER_FILE_ID = '912dcc24-5182-4ecb-b640-5f7e577a4347';

export const uploadFileSchema = z.object({
  target: z.enum(['profilePicture', 'caseStudyCover']),
  recordId: z.string().optional(),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  dataBase64: z.string().min(1),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;

export type UploadFileResult = { ok: true; url: string } | { ok: false; reason: string };

export function fieldIdForTarget(target: UploadFileInput['target']): string {
  return target === 'profilePicture' ? PROFILE_PICTURE_FILE_FIELD_ID : COVER_IMAGE_FIELD_ID;
}

// A caseStudyCover upload must carry the PartnerContent id it attaches to;
// ownership itself is checked against the live record in the handler.
export function validateUploadTarget(input: UploadFileInput): { error: string } | null {
  if (input.target === 'caseStudyCover' && !input.recordId) {
    return { error: 'recordId is required for caseStudyCover uploads' };
  }
  return null;
}

export const handler = async (event: RoutePayload<unknown>): Promise<UploadFileResult> => {
  const resolved = await resolvePartnerFromRequest(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  const parsed = uploadFileSchema.safeParse(event.body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'invalid_input');
  }
  const input = parsed.data;

  const targetError = validateUploadTarget(input);
  if (targetError) return errorResponse(targetError.error);

  const fieldId = fieldIdForTarget(input.target);

  try {
    const client = buildAppClient();

    if (input.target === 'caseStudyCover') {
      const recordId = input.recordId;
      if (!recordId) return errorResponse('recordId is required for caseStudyCover uploads');

      const contentResult = await client.query({
        partnerContents: {
          __args: { filter: { id: { eq: recordId } }, first: 1 },
          edges: { node: { id: true, partnerId: true } },
        },
      });
      const content = contentResult.partnerContents?.edges?.[0]?.node;
      if (!content || content.partnerId !== resolved.partnerId) {
        return errorResponse('FORBIDDEN');
      }

      const buffer = Buffer.from(input.dataBase64, 'base64');
      const uploaded = await client.uploadFile(
        buffer,
        input.filename,
        input.contentType,
        fieldId,
      );

      await client.mutation({
        updatePartnerContent: {
          __args: {
            id: recordId,
            data: { coverImage: [{ fileId: uploaded.id, label: input.filename }] },
          },
          id: true,
        },
      });

      return { ok: true, url: uploaded.url };
    }

    const buffer = Buffer.from(input.dataBase64, 'base64');
    const uploaded = await client.uploadFile(buffer, input.filename, input.contentType, fieldId);

    await client.mutation({
      updatePartner: {
        __args: {
          id: resolved.partnerId,
          data: { profilePictureFile: [{ fileId: uploaded.id, label: input.filename }] },
        },
        id: true,
      },
    });

    return { ok: true, url: uploaded.url };
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : String(err));
  }
};

export default defineLogicFunction({
  universalIdentifier: UPLOAD_MY_PARTNER_FILE_ID,
  name: 'upload-my-partner-file',
  description: 'Uploads a profile picture or case study cover image for the calling partner.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/upload-my-partner-file',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
