import { useEffect } from 'react';

export enum OutsideClickAlerterMode {
  absolute = 'absolute',
  dom = 'dom',
}

type OwnProps = {
  ref: React.RefObject<HTMLInputElement>;
  callback: () => void;
  mode?: OutsideClickAlerterMode;
};

export function useOutsideAlerter({
  ref,
  mode = OutsideClickAlerterMode.dom,
  callback,
}: OwnProps) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLButtonElement;

      if (!ref.current) {
        return;
      }

      if (
        mode === OutsideClickAlerterMode.dom &&
        !ref.current.contains(target)
      ) {
        callback();
      }

      if (mode === OutsideClickAlerterMode.absolute) {
        const { x, y, width, height } = ref.current.getBoundingClientRect();
        const { clientX, clientY } = event;
        if (
          clientX < x ||
          clientX > x + width ||
          clientY < y ||
          clientY > y + height
        ) {
          callback();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, mode]);
}
