import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

import { AILayerService } from '../ai-layer.service';
import {
  type DocumentUpload,
  type DocumentUploadRequest,
  type DocumentUploadResponse,
  type DocumentCategory,
} from './types/document-upload.type';

const WEBHOOK_TIMEOUT = 10000;

/**
 * Document Drop Service - Handles document uploads for Knowledge Pipeline.
 *
 * Pipeline flow:
 * 1. Upload document to Supabase Storage
 * 2. Create document record (status: pending)
 * 3. Trigger n8n → Docling processing
 * 4. kb-mcp upserts chunks with embeddings
 * 5. Document status updated to 'chunked'
 */
@Injectable()
export class DocumentDropService {
  private readonly logger = new Logger(DocumentDropService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly aiLayerService: AILayerService,
  ) {}

  private get n8nUrl(): string {
    return process.env.N8N_API_URL || 'http://n8n:5678';
  }

  /**
   * Main entry point: Handle document drop from Twenty CRM.
   */
  async handleDocumentDrop(
    request: DocumentUploadRequest,
  ): Promise<DocumentUploadResponse> {
    this.logger.log('Processing document drop', {
      workspace_id: request.workspace_id,
      profile_id: request.profile_id,
      file_name: request.file_name,
      category: request.category,
    });

    try {
      // Step 1: Generate document ID and URL (placeholder for actual storage)
      const { file_url, document_id } = await this.uploadToStorage(request);

      // Step 2: Create document record
      const document = await this.createDocumentRecord({
        document_id,
        workspace_id: request.workspace_id,
        profile_id: request.profile_id,
        file_name: request.file_name,
        file_url,
        file_size: request.file instanceof Buffer ? request.file.length : 0,
        mime_type: this.getMimeType(request.file_name),
        category: request.category,
        metadata: request.metadata,
      });

      // Step 3: Trigger Docling pipeline via n8n
      await this.triggerDoclingPipeline(document);

      return {
        success: true,
        document_id: document.id,
        file_url: document.file_url,
        status: 'pending',
        message: 'Document uploaded and queued for processing',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';

      this.logger.error('Document drop failed', {
        workspace_id: request.workspace_id,
        file_name: request.file_name,
        error: errorMessage,
      });

      return {
        success: false,
        document_id: '',
        file_url: '',
        status: 'error',
        message: errorMessage,
      };
    }
  }

  /**
   * Step 1: Upload document to Supabase Storage.
   *
   * TODO: Integrate with Twenty's actual file upload mechanism.
   * This is a placeholder that generates a document ID and URL.
   */
  private async uploadToStorage(request: DocumentUploadRequest): Promise<{
    file_url: string;
    document_id: string;
  }> {
    const document_id = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Placeholder URL - actual implementation will upload to Supabase Storage
    const file_url = `https://storage.supabase.co/${request.workspace_id}/documents/${document_id}/${request.file_name}`;

    this.logger.debug('Document prepared for storage', {
      document_id,
      workspace_id: request.workspace_id,
      file_name: request.file_name,
    });

    return { file_url, document_id };
  }

  /**
   * Step 2: Create document record in database.
   *
   * TODO: Insert into ws_knowledge.documents via Supabase.
   */
  private async createDocumentRecord(params: {
    document_id: string;
    workspace_id: string;
    profile_id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    category: string;
    metadata?: Record<string, unknown>;
  }): Promise<DocumentUpload> {
    const document: DocumentUpload = {
      id: params.document_id,
      workspace_id: params.workspace_id,
      profile_id: params.profile_id,
      file_name: params.file_name,
      file_url: params.file_url,
      file_size: params.file_size,
      mime_type: params.mime_type,
      category: params.category as DocumentCategory,
      status: 'pending',
      uploaded_at: new Date(),
      metadata: params.metadata as DocumentUpload['metadata'],
    };

    // TODO: Insert into Supabase database
    this.logger.debug('Document record created', {
      document_id: document.id,
      status: document.status,
    });

    return document;
  }

  /**
   * Step 3: Trigger n8n webhook to start Docling processing.
   */
  private async triggerDoclingPipeline(document: DocumentUpload): Promise<void> {
    const webhookUrl = `${this.n8nUrl}/webhook/docling/intake`;

    this.logger.debug('Triggering Docling pipeline', {
      document_id: document.id,
      webhook_url: webhookUrl,
    });

    try {
      const response = await firstValueFrom(
        this.httpService
          .post(webhookUrl, {
            workspace_id: document.workspace_id,
            document_id: document.id,
            file_url: document.file_url,
            file_name: document.file_name,
            category: document.category,
            profile_id: document.profile_id,
            metadata: document.metadata,
          })
          .pipe(
            timeout(WEBHOOK_TIMEOUT),
            catchError((error) => {
              throw new Error(`Docling webhook failed: ${error.message}`);
            }),
          ),
      );

      this.logger.log('Docling pipeline triggered', {
        document_id: document.id,
        response_status: response.status,
      });
    } catch (error) {
      this.logger.error('Failed to trigger Docling pipeline', {
        document_id: document.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });

      // Report error to AI Layer
      await this.aiLayerService.reportError({
        workspace_id: document.workspace_id,
        profile_id: document.profile_id,
        error_type: 'DocumentPipelineError',
        error_message: `Failed to trigger Docling: ${error}`,
        criticality: 'error',
        workflow_id: 'document-drop',
        workflow_name: 'Document Drop Pipeline',
        additional_context: {
          document_id: document.id,
          file_name: document.file_name,
        },
      });

      throw error;
    }
  }

  /**
   * Get MIME type from file extension.
   */
  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      txt: 'text/plain',
      html: 'text/html',
      htm: 'text/html',
      md: 'text/markdown',
      json: 'application/json',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}
