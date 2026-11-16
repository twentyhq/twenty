import { Injectable } from '@nestjs/common';

import { basename } from 'path';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { ReadFileInputZodSchema } from 'src/engine/core-modules/tool/tools/read-file-tool/read-file-tool.schema';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';

const FAILURE_MESSAGE = 'Could not read this file';

@Injectable()
export class ReadFileTool implements Tool {
  description =
    'Read a PDF or an image attached to a record, such as a files field or an email attachment. Pass the signed url returned with the record. The content of the file is added to the conversation right after this call. For other file types, pass the url to code_interpreter instead.';
  inputSchema = ReadFileInputZodSchema;

  constructor(private readonly fileService: FileService) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const parseResult = ReadFileInputZodSchema.safeParse(parameters);

    if (!parseResult.success) {
      return {
        success: false,
        message: FAILURE_MESSAGE,
        error: parseResult.error.message,
      };
    }

    const { url, filename: requestedFilename } = parseResult.data;

    const file = await this.fileService.getFileBySignedUrl({
      fileUrl: url,
      workspaceId: context.workspaceId,
    });

    if (!isDefined(file)) {
      return {
        success: false,
        message: FAILURE_MESSAGE,
        error:
          'This file link is not valid or it expired, or the file no longer exists. Fetch the record again to get a fresh link.',
      };
    }

    const filename = isNonEmptyString(requestedFilename)
      ? requestedFilename
      : basename(file.path);

    return {
      success: true,
      message: `The content of ${filename} follows this tool result`,
      modelInputFile: { url, filename, mediaType: file.mimeType },
    };
  }
}
