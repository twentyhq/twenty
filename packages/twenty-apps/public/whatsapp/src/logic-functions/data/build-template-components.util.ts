import { isDefined } from 'twenty-sdk/utils';
import {
  type TemplateButtonParameterInput,
  type TemplateHeaderMediaInput,
  type TemplateParameterInput,
} from 'src/logic-functions/data/send-template-message-params.schema';
import {
  type WhatsAppApiSendMessageRequest,
  type WhatsAppApiTemplateParameter,
} from 'src/logic-functions/types/whatsapp-api.type';

type TemplateMessage = Extract<WhatsAppApiSendMessageRequest, { type: 'template' }>['template'];

const buildHeaderMediaParameter = (headerMedia: TemplateHeaderMediaInput): WhatsAppApiTemplateParameter => {
  const source = 'link' in headerMedia ? { link: headerMedia.link } : { id: headerMedia.id };

  switch (headerMedia.type) {
    case 'image':
      return { type: 'image', image: source };
    case 'video':
      return { type: 'video', video: source };
    case 'document':
      return {
        type: 'document',
        document: { ...source, ...(isDefined(headerMedia.filename) ? { filename: headerMedia.filename } : {}) },
      };
  }
};

const buildButtonParameter = ({
  subType,
  value,
}: TemplateButtonParameterInput): WhatsAppApiTemplateParameter => {
  switch (subType) {
    case 'quick_reply':
      return { type: 'payload', payload: value };
    case 'url':
      return { type: 'text', text: value };
    case 'copy_code':
      return { type: 'coupon_code', coupon_code: value };
  }
};

export const buildTemplateComponents = ({
  bodyParameters,
  headerParameters,
  headerMedia,
  buttonParameters,
  parameterFormat,
}: {
  bodyParameters: TemplateParameterInput[];
  headerParameters: TemplateParameterInput[];
  headerMedia?: TemplateHeaderMediaInput;
  buttonParameters: TemplateButtonParameterInput[];
  parameterFormat: string | null | undefined;
}): TemplateMessage['components'] => {
  const isNamed = parameterFormat === 'NAMED';

  const buildTextParameters = (parameters: TemplateParameterInput[]): WhatsAppApiTemplateParameter[] => {
    if (isNamed && parameters.some((parameter) => !isDefined(parameter.name))) {
      throw new Error('Every parameter needs a name for a template with named parameters');
    }

    return parameters.map((parameter) => ({
      type: 'text',
      text: parameter.value,
      ...(isNamed ? { parameter_name: parameter.name } : {}),
    }));
  };

  const components: NonNullable<TemplateMessage['components']> = [
    ...(headerParameters.length > 0
      ? [{ type: 'header' as const, parameters: buildTextParameters(headerParameters) }]
      : []),
    ...(isDefined(headerMedia)
      ? [{ type: 'header' as const, parameters: [buildHeaderMediaParameter(headerMedia)] }]
      : []),
    ...(bodyParameters.length > 0
      ? [{ type: 'body' as const, parameters: buildTextParameters(bodyParameters) }]
      : []),
    ...buttonParameters.map((buttonParameter) => ({
      type: 'button' as const,
      sub_type: buttonParameter.subType,
      index: String(buttonParameter.index),
      parameters: [buildButtonParameter(buttonParameter)],
    })),
  ];

  return components.length > 0 ? components : undefined;
};
