import type { UpdateTemplateDto } from '@modules/resend/sync/types/update-template.dto';

export type CreateTemplateDto = UpdateTemplateDto & {
  createdAt: string;
};
