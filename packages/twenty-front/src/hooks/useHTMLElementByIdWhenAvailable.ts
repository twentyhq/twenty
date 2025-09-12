import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useHTMLElementByIdWhenAvailable = (id: string) => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isObserving, setIsObserving] = useState<boolean>(false);

  useEffect(() => {
    if (isObserving || isDefined(element)) {
      return;
    }

    const elementFoundBeforeObservingMutation = document.getElementById(id);

    if (isDefined(elementFoundBeforeObservingMutation)) {
      setElement(elementFoundBeforeObservingMutation);
      return;
    }

    const mutationObserver = new MutationObserver(() => {
      const elementObserved = document.getElementById(id);

      if (isDefined(elementObserved) && !isDefined(element)) {
        setElement(elementObserved);
        setIsObserving(false);
        mutationObserver.disconnect();
      }
    });

    if (!isObserving && !isDefined(element)) {
      setIsObserving(true);
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }, [element, id, isObserving]);

  return {
    element,
  };
};
