/**
 * Document upload types for AI Layer Knowledge Pipeline.
 *
 * Pipeline: Twenty → Supabase Storage → n8n → Docling → kb-mcp
 */

export type DocumentStatus =
  | 'pending'
  | 'processing'
  | 'chunked'
  | 'error';

export type DocumentCategory =
  | 'contract'
  | 'policy'
  | 'training'
  | 'onboarding'
  | 'compliance'
  | 'general';

export type DocumentUpload = {
  id: string;
  workspace_id: string;
  profile_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  category: DocumentCategory;
  status: DocumentStatus;
  uploaded_at: Date;
  processed_at?: Date;
  chunk_count?: number;
  error_message?: string;
  metadata?: {
    contact_id?: string;
    tags?: string[];
    description?: string;
  };
};

export type DocumentUploadRequest = {
  workspace_id: string;
  profile_id: string;
  file: Buffer | Blob;
  file_name: string;
  category: DocumentCategory;
  metadata?: DocumentUpload['metadata'];
};

export type DocumentUploadResponse = {
  success: boolean;
  document_id: string;
  file_url: string;
  status: DocumentStatus;
  message: string;
};
