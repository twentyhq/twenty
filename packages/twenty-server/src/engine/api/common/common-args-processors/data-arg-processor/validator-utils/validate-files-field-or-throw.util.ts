import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';
import { z } from 'zod';

import {
  type AddFileItemInput,
  type AddOrUpdateFileItemInput,
  type RemoveFileItemInput,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

const addOrUpdateFileItemSchema = z
  .object({
    fileId: z.string().uuidv4(),
    label: z.string(),
  })
  .strict();

const removeFileItemSchema = z
  .object({
    fileId: z.string().uuidv4(),
  })
  .strict();

export const filesFieldSchema = z
  .object({
    addFiles: z.array(addOrUpdateFileItemSchema).optional(),
    updateFiles: z.array(addOrUpdateFileItemSchema).optional(),
    removeFiles: z.array(removeFileItemSchema).optional(),
  })
  .strict();

export type FilesFieldInput = {
  addFiles?: AddOrUpdateFileItemInput[];
  updateFiles?: AddOrUpdateFileItemInput[];
  removeFiles?: RemoveFileItemInput[];
};

export type EnrichedFilesFieldInput = {
  addFiles?: (AddFileItemInput & { extension: string })[];
  updateFiles?: AddOrUpdateFileItemInput[];
  removeFiles?: RemoveFileItemInput[];
};

export const validateFilesFieldOrThrow = (
  value: unknown,
  fieldName: string,
): FilesFieldInput | null => {
  if (isNull(value)) return null;

  let parsedValue: unknown = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      const inspectedValue = inspect(value);

      throw new CommonQueryRunnerException(
        `Invalid value "${inspectedValue}" for FILES field "${fieldName}" - It should be an object with "addFiles" and/or "removeFiles" properties.`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Invalid value "${inspectedValue}" for FILES field "${fieldName}" - It should be an object with "addFiles" and/or "removeFiles" properties.`,
        },
      );
    }
  }

  const result = filesFieldSchema.safeParse(parsedValue);

  if (!result.success) {
    const inspectedValue = inspect(parsedValue);
    const errorMessage = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    throw new CommonQueryRunnerException(
      `Invalid value "${inspectedValue}" for FILES field "${fieldName}" - ${errorMessage}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      {
        userFriendlyMessage: msg`Invalid value for FILES field "${fieldName}" - ${errorMessage}`,
      },
    );
  }

  return result.data;
};
