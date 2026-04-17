import type { UpdateTemplateDto } from 'src/modules/resend/types/update-template.dto';

export type CreateTemplateDto = UpdateTemplateDto & {
  createdAt: string;
};
