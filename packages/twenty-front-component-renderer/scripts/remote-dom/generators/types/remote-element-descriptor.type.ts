import { type PropertySchema } from '../schemas';

export type RemoteElementDescriptor = {
  elementName: string;
  propertiesTypeName: string;
  isHtmlElement: boolean;
  hasProperties: boolean;
  specificProperties: Record<string, PropertySchema>;
  hasSpecificProperties: boolean;
  hasCommonHtmlEvents: boolean;
  customEvents: readonly string[];
  alwaysForwardedEvents: readonly string[];
  hasEvents: boolean;
};
