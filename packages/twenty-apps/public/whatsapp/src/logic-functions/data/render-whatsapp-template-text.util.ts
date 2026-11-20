import { isNonEmptyString } from '@sniptt/guards';
import { type TemplateParameterInput } from 'src/logic-functions/types/send-template-message-params.type';
import { type WhatsAppApiTemplateDefinitionComponent } from 'src/logic-functions/types/whatsapp-api.type';

// rebuilds the text the recipient sees, to store the sent template in its conversation
export const renderWhatsAppTemplateText = ({
  components,
  headerParameters,
  bodyParameters,
  parameterFormat,
}: {
  components: Pick<WhatsAppApiTemplateDefinitionComponent, 'type' | 'format' | 'text'>[];
  headerParameters: TemplateParameterInput[];
  bodyParameters: TemplateParameterInput[];
  parameterFormat: string | null | undefined;
}): string => {
  const isNamed = parameterFormat === 'NAMED';

  const fillParameters = (text: string, parameters: TemplateParameterInput[]) =>
    text.replace(/\{\{\s*(\w+)\s*\}\}/g, (placeholder, key: string) => {
      const parameter = isNamed
        ? parameters.find(({ name }) => name === key)
        : parameters[Number(key) - 1];

      return parameter?.value ?? placeholder;
    });

  const findComponentText = (type: string) =>
    components.find((component) => component.type.toUpperCase() === type)?.text;

  const header = components.find((component) => component.type.toUpperCase() === 'HEADER');

  return [
    header?.format?.toUpperCase() === 'TEXT' && isNonEmptyString(header.text)
      ? fillParameters(header.text, headerParameters)
      : undefined,
    fillParameters(findComponentText('BODY') ?? '', bodyParameters),
    findComponentText('FOOTER'),
  ]
    .filter(isNonEmptyString)
    .join('\n\n');
};
