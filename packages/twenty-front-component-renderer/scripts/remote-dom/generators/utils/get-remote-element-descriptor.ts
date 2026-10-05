import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ComponentSchema } from '../schemas';
import { type RemoteElementDescriptor } from '../types/remote-element-descriptor.type';
import { getSpecificProperties } from './get-specific-properties';

export const getRemoteElementDescriptor = ({
  component,
  commonPropertyNames,
  commonEventNames,
}: {
  component: ComponentSchema;
  commonPropertyNames: Set<string>;
  commonEventNames: Set<string>;
}): RemoteElementDescriptor => {
  const isHtmlElement = isDefined(component.htmlTag);

  const specificProperties = isHtmlElement
    ? getSpecificProperties({
        properties: component.properties,
        commonPropertyNames,
      })
    : component.properties;

  const hasCommonHtmlEvents = isHtmlElement && commonEventNames.size > 0;

  const customEvents = hasCommonHtmlEvents
    ? component.events.filter((eventName) => !commonEventNames.has(eventName))
    : component.events;

  return {
    elementName: `${component.name}Element`,
    propertiesTypeName: `${component.name}Properties`,
    isHtmlElement,
    hasProperties: isNonEmptyArray(Object.keys(component.properties)),
    specificProperties,
    hasSpecificProperties: isNonEmptyArray(Object.keys(specificProperties)),
    hasCommonHtmlEvents,
    customEvents,
    hasEvents: hasCommonHtmlEvents || isNonEmptyArray(customEvents),
  };
};
