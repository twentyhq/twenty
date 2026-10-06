import { TYPE_NAMES } from '../constants';
import { type RemoteElementDescriptor } from '../types/remote-element-descriptor.type';

export const resolveElementPropertiesType = ({
  propertiesTypeName,
  isHtmlElement,
  hasProperties,
  hasSpecificProperties,
}: Pick<
  RemoteElementDescriptor,
  | 'propertiesTypeName'
  | 'isHtmlElement'
  | 'hasProperties'
  | 'hasSpecificProperties'
>): string => {
  if (hasSpecificProperties) {
    return propertiesTypeName;
  }

  if (isHtmlElement && hasProperties) {
    return TYPE_NAMES.COMMON_PROPERTIES;
  }

  return TYPE_NAMES.EMPTY_RECORD;
};
