export type UnipileMessageAttachment = {
  id: string;
  type: 'img' | 'video' | 'audio' | 'file' | 'shared_content' | 'contact_card';
  mimetype: string;
  file_size?: number;
  is_unavailable?: boolean;
  content?: string;
};
