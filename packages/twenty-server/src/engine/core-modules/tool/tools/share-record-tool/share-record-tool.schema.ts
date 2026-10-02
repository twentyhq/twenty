import { RecordShareAccessLevel } from 'twenty-shared/types';
import { z } from 'zod';

export const ShareRecordToolInputZodSchema = z
  .object({
    objectNameSingular: z
      .string()
      .describe(
        'The singular name of the object the record belongs to (e.g. "company", "person", "opportunity")',
      ),
    recordId: z.string().uuid().describe('The id of the record to share'),
    workspaceMemberId: z
      .string()
      .uuid()
      .optional()
      .describe(
        'The id of the workspace member to share the record with. Find it with find_many_workspace_members. Set either workspaceMemberId or roleId, not both.',
      ),
    roleId: z
      .string()
      .uuid()
      .optional()
      .describe(
        'The id of the role whose members the record is shared with. Find it with list_roles. Set either workspaceMemberId or roleId, not both.',
      ),
    accessLevel: z
      .enum([
        RecordShareAccessLevel.READ,
        RecordShareAccessLevel.READ_WRITE,
        RecordShareAccessLevel.FULL,
      ])
      .default(RecordShareAccessLevel.READ)
      .describe(
        'READ to view the record, READ_WRITE to also edit it, FULL to also manage who it is shared with. Defaults to READ.',
      ),
  })
  .refine(
    ({ workspaceMemberId, roleId }) =>
      (workspaceMemberId === undefined) !== (roleId === undefined),
    { message: 'Set exactly one of workspaceMemberId or roleId' },
  );

export type ShareRecordToolInput = z.infer<
  typeof ShareRecordToolInputZodSchema
>;
