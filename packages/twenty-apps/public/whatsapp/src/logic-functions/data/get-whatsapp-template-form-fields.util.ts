import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppTemplateComponent } from 'src/logic-functions/types/whatsapp-template-component.type';
import { type WhatsAppTemplateFormFields } from 'src/logic-functions/types/whatsapp-template-form-fields.type';

const PLACEHOLDER_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

const getPlaceholderKeys = (text: string | undefined): string[] =>
  isNonEmptyString(text) ? [...new Set([...text.matchAll(PLACEHOLDER_PATTERN)].map(([, key]) => key ?? ''))] : [];

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
    headerParameterKeys: headerFormat === 'TEXT' ? getPlaceholderKeys(header?.text) : [],
    headerMediaType:
      headerFormat === 'IMAGE' ? 'image' : headerFormat === 'VIDEO' ? 'video' : headerFormat === 'DOCUMENT' ? 'document' : undefined,
    bodyParameterKeys: getPlaceholderKeys(findComponent(components, 'BODY')?.text),
    buttonInputs: buttons.flatMap((button, index): WhatsAppTemplateFormFields['buttonInputs'] => {
      if (button.type.toUpperCase() === 'URL' && getPlaceholderKeys(button.url).length > 0) {
        return [{ index, subType: 'url', label: button.text ?? button.url ?? '' }];
      }

      if (button.type.toUpperCase() === 'COPY_CODE') {
        return [{ index, subType: 'copy_code', label: button.text ?? '' }];
      }

      return [];
    }),
  };
};
