import type { UpdateTemplateDto } from 'src/modules/resend/sync/types/update-template.dto';

export type CreateTemplateDto = UpdateTemplateDto & {
  createdAt: string;
};
