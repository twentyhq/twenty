import { useEffect } from 'react';

export const useListenToBrowserEvent = <T>({
  onBrowserEvent,
  eventName,
}: {
  onBrowserEvent: (detail?: T) => void;
  eventName: string;
}) => {
  useEffect(() => {
    const handleWindowDOMEvent = (event: CustomEvent<T>) => {
      const detail = event.detail;

      onBrowserEvent(detail);
    };

    window.addEventListener(eventName, handleWindowDOMEvent as EventListener);

    return () => {
      window.removeEventListener(
        eventName,
        handleWindowDOMEvent as EventListener,
      );
    };
  }, [eventName, onBrowserEvent]);
};
