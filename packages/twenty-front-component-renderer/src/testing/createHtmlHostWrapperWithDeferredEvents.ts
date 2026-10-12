import { isFunction } from '@sniptt/guards';
import { createElement } from 'react';

import { createHtmlHostWrapper } from '@/host/elements/utils/createHtmlHostWrapper';
import { isEventHandlerKey } from '@/host/events/utils/isEventHandlerKey';

export const createHtmlHostWrapperWithDeferredEvents = ({
  htmlTag,
  deferHostEvent,
}: {
  htmlTag: string;
  deferHostEvent: (dispatchHostEvent: () => void) => void;
}) => {
  const HtmlHostWrapper = createHtmlHostWrapper(htmlTag);

  return (props: Record<string, unknown>) =>
    createElement(
      HtmlHostWrapper,
      Object.fromEntries(
        Object.entries(props).map(([key, value]) => [
          key,
          isEventHandlerKey(key) && isFunction(value)
            ? (...eventArguments: unknown[]) =>
                deferHostEvent(() => value(...eventArguments))
            : value,
        ]),
      ),
    );
};
