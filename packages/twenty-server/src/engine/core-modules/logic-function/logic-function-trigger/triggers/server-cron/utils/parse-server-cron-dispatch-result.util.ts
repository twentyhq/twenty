import { type ServerCronDispatchResult } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { z } from 'zod';

import { SERVER_CRON_MAX_CONTINUATION_DELAY_MS } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-continuation-delay-ms.constant';
import { SERVER_CRON_MAX_CURSOR_SIZE_BYTES } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-cursor-size-bytes.constant';
import { SERVER_CRON_MAX_DISPATCH_DELAY_MS } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-dispatch-delay-ms.constant';
import { SERVER_CRON_MAX_DISPATCH_PAYLOAD_SIZE_BYTES } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-dispatch-payload-size-bytes.constant';
import { SERVER_CRON_MAX_DISPATCHES_PER_STEP } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-dispatches-per-step.constant';
import { SERVER_CRON_MAX_RESULT_SIZE_BYTES } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/constants/server-cron-max-result-size-bytes.constant';

export type ParseServerCronDispatchResultOutcome =
  | { isValid: true; dispatchResult: ServerCronDispatchResult }
  | { isValid: false; errorMessage: string };

const plainObjectSchema = z.custom<Record<string, unknown>>((value) =>
  isPlainObject(value),
);

const getSerializedSizeBytes = (value: unknown): number =>
  Buffer.byteLength(JSON.stringify(value) ?? '');

const serverCronDispatchResultSchema = z
  .strictObject({
    dispatches: z
      .array(
        z.strictObject({
          workspaceId: z.uuid(),
          targetLogicFunctionUniversalIdentifier: z.uuid(),
          payload: plainObjectSchema.optional(),
          delayMs: z
            .number()
            .int()
            .min(0)
            .max(SERVER_CRON_MAX_DISPATCH_DELAY_MS)
            .optional(),
        }),
      )
      .max(SERVER_CRON_MAX_DISPATCHES_PER_STEP),
    next: z
      .strictObject({
        cursor: plainObjectSchema,
        delayMs: z
          .number()
          .int()
          .min(0)
          .max(SERVER_CRON_MAX_CONTINUATION_DELAY_MS)
          .optional(),
      })
      .nullish(),
  })
  .superRefine(({ dispatches, next }, context) => {
    const dispatchKeys = new Set<string>();

    dispatches.forEach((dispatch, index) => {
      const dispatchKey = `${dispatch.workspaceId}.${dispatch.targetLogicFunctionUniversalIdentifier}`;

      if (dispatchKeys.has(dispatchKey)) {
        context.addIssue({
          code: 'custom',
          path: ['dispatches', index],
          message: `Duplicate dispatch to ${dispatch.targetLogicFunctionUniversalIdentifier} in workspace ${dispatch.workspaceId}`,
        });
      }

      dispatchKeys.add(dispatchKey);

      if (
        isDefined(dispatch.payload) &&
        getSerializedSizeBytes(dispatch.payload) >
          SERVER_CRON_MAX_DISPATCH_PAYLOAD_SIZE_BYTES
      ) {
        context.addIssue({
          code: 'custom',
          path: ['dispatches', index, 'payload'],
          message: `Dispatch payload exceeds ${SERVER_CRON_MAX_DISPATCH_PAYLOAD_SIZE_BYTES} bytes`,
        });
      }
    });

    if (
      isDefined(next) &&
      getSerializedSizeBytes(next.cursor) > SERVER_CRON_MAX_CURSOR_SIZE_BYTES
    ) {
      context.addIssue({
        code: 'custom',
        path: ['next', 'cursor'],
        message: `Cursor exceeds ${SERVER_CRON_MAX_CURSOR_SIZE_BYTES} bytes`,
      });
    }
  });

export const parseServerCronDispatchResult = (
  data: unknown,
): ParseServerCronDispatchResultOutcome => {
  if (getSerializedSizeBytes(data) > SERVER_CRON_MAX_RESULT_SIZE_BYTES) {
    return {
      isValid: false,
      errorMessage: `Server cron result exceeds ${SERVER_CRON_MAX_RESULT_SIZE_BYTES} bytes`,
    };
  }

  const parsedResult = serverCronDispatchResultSchema.safeParse(data);

  if (!parsedResult.success) {
    return {
      isValid: false,
      errorMessage: `Server cron handler must return { dispatches: { workspaceId, targetLogicFunctionUniversalIdentifier, payload?, delayMs? }[]; next?: { cursor, delayMs? } }: ${z.prettifyError(parsedResult.error)}`,
    };
  }

  const { dispatches, next } = parsedResult.data;

  return {
    isValid: true,
    dispatchResult: {
      dispatches,
      ...(isDefined(next) ? { next } : {}),
    },
  };
};
