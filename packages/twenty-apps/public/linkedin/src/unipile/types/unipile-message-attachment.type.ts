export type UnipileMessageAttachment = {
  id: string;
  type: 'img' | 'video' | 'audio' | 'file' | 'shared_content' | 'contact_card';
  mimetype: string;
  file_size?: number;
  is_unavailable?: boolean;
  // Base64 file, when Unipile sends it inline instead of behind a download
  content?: string;
};
