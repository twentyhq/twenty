import React, { useCallback, useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { triggeredMouseDownInsideFamilyState } from '../states/triggeredMouseDownInsideFamilyState';

export enum ClickOutsideMode {
  absolute = 'absolute',
  dom = 'dom',
}

export const useListenClickOutside = <T extends Element>({
  refs,
  callback,
  mode = ClickOutsideMode.dom,
  enabled = true,
  listenerUUID,
}: {
  listenerUUID?: string;
  refs: Array<React.RefObject<T>>;
  callback: (event: MouseEvent | TouchEvent) => void;
  mode?: ClickOutsideMode;
  enabled?: boolean;
}) => {
  // if (!isNonEmptyString(listenerUUID)) {
  //   throw new Error('listenerUUID must be a non-empty string');
  // }

  console.log({
    listenerUUID,
  });

  const [, setTriggeredMouseDownInside] = useRecoilState(
    triggeredMouseDownInsideFamilyState(listenerUUID ?? 'asd'),
  );

  const getTriggeredMouseDownInside = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        return snapshot
          .getLoadable(
            triggeredMouseDownInsideFamilyState(listenerUUID ?? 'asd'),
          )
          .getValue();
      },
    [listenerUUID],
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      setTriggeredMouseDownInside(false);

      if (mode === ClickOutsideMode.dom) {
        const triggeredMouseDownOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => ref.current?.contains(event.target as Node));

        if (triggeredMouseDownOnAtLeastOneRef) {
          console.log('triggeredMouseDownOnAtLeastOneRef', listenerUUID);
          setTriggeredMouseDownInside(true);
        }
      }

      if (mode === ClickOutsideMode.absolute) {
        const triggeredMouseDownOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => {
            if (!ref.current) {
              return false;
            }

            const { x, y, width, height } = ref.current.getBoundingClientRect();

            const clientX =
              'clientX' in event
                ? event.clientX
                : event.changedTouches[0].clientX;
            const clientY =
              'clientY' in event
                ? event.clientY
                : event.changedTouches[0].clientY;

            if (
              clientX < x ||
              clientX > x + width ||
              clientY < y ||
              clientY > y + height
            ) {
              return false;
            }
            return true;
          });

        if (triggeredMouseDownOnAtLeastOneRef) {
          console.log('triggeredMouseDownOnAtLeastOneRef', listenerUUID);
          setTriggeredMouseDownInside(true);
        }
      }
    },
    [mode, refs, setTriggeredMouseDownInside, listenerUUID],
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const triggeredMouseDownInside = getTriggeredMouseDownInside();

      console.log({
        triggeredMouseDownInside,
        listenerUUID,
      });

      if (mode === ClickOutsideMode.dom) {
        const clickedOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => ref.current?.contains(event.target as Node));

        console.log({
          clickedOnAtLeastOneRef,
          triggeredMouseDownInside,
        });

        if (!clickedOnAtLeastOneRef && !triggeredMouseDownInside) {
          console.log('calling callback dom mode', listenerUUID);
          callback(event);
        }
      }

      if (mode === ClickOutsideMode.absolute) {
        const clickedOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => {
            if (!ref.current) {
              return false;
            }

            const { x, y, width, height } = ref.current.getBoundingClientRect();

            const clientX =
              'clientX' in event
                ? event.clientX
                : event.changedTouches[0].clientX;
            const clientY =
              'clientY' in event
                ? event.clientY
                : event.changedTouches[0].clientY;

            if (
              clientX < x ||
              clientX > x + width ||
              clientY < y ||
              clientY > y + height
            ) {
              return false;
            }
            return true;
          });

        console.log({
          clickedOnAtLeastOneRef,
          triggeredMouseDownInside,
          listenerUUID,
        });

        if (!clickedOnAtLeastOneRef && !triggeredMouseDownInside) {
          console.log('calling callback absolute  mode', listenerUUID);
          callback(event);
        }
      }
    },
    [callback, mode, refs, getTriggeredMouseDownInside, listenerUUID],
  );

  useEffect(() => {
    if (enabled) {
      console.log('adding event listeners', listenerUUID);
      document.addEventListener('mousedown', handleMouseDown, {
        capture: true,
      });
      document.addEventListener('mouseup', handleMouseUp, {
        capture: true,
      });

      document.addEventListener('touchstart', handleMouseDown, {
        capture: true,
      });
      document.addEventListener('touchend', handleMouseUp, {
        capture: true,
      });

      return () => {
        console.log('removing event listeners', listenerUUID);

        document.removeEventListener('mousedown', handleMouseDown, {
          capture: true,
        });
        document.removeEventListener('mouseup', handleMouseUp, {
          capture: true,
        });

        document.removeEventListener('touchstart', handleMouseDown, {
          capture: true,
        });
        document.removeEventListener('touchend', handleMouseUp, {
          capture: true,
        });
      };
    }
  }, [
    refs,
    callback,
    mode,
    enabled,
    handleMouseDown,
    handleMouseUp,
    listenerUUID,
  ]);
};

export const useListenClickOutsideByClassName = ({
  classNames,
  excludeClassNames,
  callback,
}: {
  classNames: string[];
  excludeClassNames?: string[];
  callback: () => void;
}) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node)) return;

      const clickedElement = event.target as HTMLElement;
      let isClickedInside = false;
      let isClickedOnExcluded = false;
      let currentElement: HTMLElement | null = clickedElement;

      while (currentElement) {
        const currentClassList = currentElement.classList;

        isClickedInside = classNames.some((className) =>
          currentClassList.contains(className),
        );
        isClickedOnExcluded =
          excludeClassNames?.some((className) =>
            currentClassList.contains(className),
          ) ?? false;

        if (isClickedInside || isClickedOnExcluded) {
          break;
        }

        currentElement = currentElement.parentElement;
      }

      if (!isClickedInside && !isClickedOnExcluded) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside, {
      capture: true,
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside, {
        capture: true,
      });
    };
  }, [callback, classNames, excludeClassNames]);
};
