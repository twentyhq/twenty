export type WhatsAppTemplateFormFields = {
  headerParameterKeys: string[];
  headerMediaType: 'image' | 'video' | 'document' | undefined;
  bodyParameterKeys: string[];
  buttonInputs: Array<{ index: number; subType: 'url' | 'copy_code'; label: string }>;
};
