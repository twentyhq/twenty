import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';
import { buildSignedPath } from 'twenty-shared/utils';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileMetadataService } from 'src/engine/core-modules/file/services/file-metadata.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { AgentChatService } from './agent-chat.service';
import { AgentStreamingService } from './agent-streaming.service';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Controller('rest/agent-chat')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class AgentChatController {
  constructor(
    private readonly agentChatService: AgentChatService,
    private readonly agentStreamingService: AgentStreamingService,
    private readonly fileMetadataService: FileMetadataService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('threads/:agentId')
  async getThreadsForAgent(
    @Param('agentId') agentId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.getThreadsForAgent(agentId, userWorkspaceId);
  }

  @Get('threads/:threadId/messages')
  async getMessagesForThread(
    @Param('threadId') threadId: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.getMessagesForThread(
      threadId,
      userWorkspaceId,
    );
  }

  @Post('threads')
  async createThread(
    @Body() body: { agentId: string },
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.agentChatService.createThread(body.agentId, userWorkspaceId);
  }

  @Post('stream')
  async streamAgentChat(
    @Body()
    body: { threadId: string; userMessage: string; fileIds?: string[] },
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Res() res: Response,
  ) {
    try {
      await this.agentStreamingService.streamAgentChat({
        threadId: body.threadId,
        userMessage: body.userMessage,
        userWorkspaceId,
        fileIds: body.fileIds || [],
        res,
      });
    } catch (error) {
      // Handle errors at controller level for streaming responses
      // since the RestApiExceptionFilter interferes with our streaming error handling
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
      }

      res.write(
        JSON.stringify({
          type: 'error',
          message: errorMessage,
        }) + '\n',
      );

      res.end();
    }
  }

  @Post('files')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: UploadedFile,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    const buffer = file.buffer;

    const { files } = await this.fileUploadService.uploadFile({
      file: buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
      fileFolder: FileFolder.Attachment,
      workspaceId: workspaceId,
    });

    if (!files.length) {
      throw new Error('Failed to upload file');
    }

    const signedPath = buildSignedPath({
      path: files[0].path,
      token: files[0].token,
    });

    const fileRecord = await this.fileMetadataService.createFile({
      name: file.originalname,
      fullPath: `${process.env.SERVER_URL}/files/${signedPath}`,
      size: buffer.length,
      type: file.mimetype,
      workspaceId: workspaceId,
    });

    return fileRecord;
  }

  @Delete('files/:fileId')
  async deleteFile(
    @Param('fileId') fileId: string,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    const deletedFile = await this.fileMetadataService.deleteFileById(
      fileId,
      workspaceId,
    );

    if (!deletedFile) {
      throw new Error('File not found');
    }

    return { success: true, deletedFile };
  }
}
