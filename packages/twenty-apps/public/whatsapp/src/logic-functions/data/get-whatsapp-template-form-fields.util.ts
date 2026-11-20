import { getTemplatePlaceholderKeys } from 'src/logic-functions/data/get-template-placeholder-keys.util';
import { type WhatsAppTemplateComponent } from 'src/logic-functions/types/whatsapp-template-component.type';
import { type WhatsAppTemplateFormFields } from 'src/logic-functions/types/whatsapp-template-form-fields.type';

const findComponent = (components: WhatsAppTemplateComponent[], type: string) =>
  components.find((component) => component.type.toUpperCase() === type);

// what has to be filled in before a template can be sent
export const getWhatsAppTemplateFormFields = (
  components: WhatsAppTemplateComponent[],
): WhatsAppTemplateFormFields => {
  const header = findComponent(components, 'HEADER');
  const headerFormat = header?.format?.toUpperCase();
  const buttons = findComponent(components, 'BUTTONS')?.buttons ?? [];

  return {
    headerParameterKeys: headerFormat === 'TEXT' ? getTemplatePlaceholderKeys(header?.text) : [],
    headerMediaType:
      headerFormat === 'IMAGE' ? 'image' : headerFormat === 'VIDEO' ? 'video' : headerFormat === 'DOCUMENT' ? 'document' : undefined,
    bodyParameterKeys: getTemplatePlaceholderKeys(findComponent(components, 'BODY')?.text),
    buttonInputs: buttons.flatMap((button, index): WhatsAppTemplateFormFields['buttonInputs'] => {
      if (button.type.toUpperCase() === 'URL' && getTemplatePlaceholderKeys(button.url).length > 0) {
        return [{ index, subType: 'url', label: button.text ?? button.url ?? '' }];
      }

      if (button.type.toUpperCase() === 'COPY_CODE') {
        return [{ index, subType: 'copy_code', label: button.text ?? '' }];
      }

      return [];
    }),
  };
};
