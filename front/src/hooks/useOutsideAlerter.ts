import { useEffect } from 'react';

declare type CallbackType = () => void;

export function useOutsideAlerter(
  ref: React.RefObject<HTMLInputElement>,
  callback: CallbackType,
) {
  useEffect(() => {
    function handleClickOutside(event: Event) {
      const target = event.target as HTMLButtonElement;
      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
