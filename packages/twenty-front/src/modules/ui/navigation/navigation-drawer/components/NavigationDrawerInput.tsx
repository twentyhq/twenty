import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { FocusEvent, useRef } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { IconComponent, TablerIconsProps } from 'twenty-ui/display';

type NavigationDrawerInputProps = {
  className?: string;
  Icon?: IconComponent | ((props: TablerIconsProps) => JSX.Element);
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel: (value: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, value: string) => void;
  hotkeyScope: string;
};

const NAVIGATION_DRAWER_INPUT_FOCUS_ID = 'navigation-drawer-input';

export const NavigationDrawerInput = ({
  className,
  placeholder,
  Icon,
  value,
  onChange,
  onSubmit,
  onCancel,
  onClickOutside,
  hotkeyScope,
}: NavigationDrawerInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeysOnFocusedElement({
    keys: Key.Escape,
    callback: () => {
      onCancel(value);
      removeFocusItemFromFocusStackById({
        focusId: NAVIGATION_DRAWER_INPUT_FOCUS_ID,
      });
    },
    focusId: NAVIGATION_DRAWER_INPUT_FOCUS_ID,
    scope: hotkeyScope,
  });

  useHotkeysOnFocusedElement({
    keys: Key.Enter,
    callback: () => {
      onSubmit(value);
      removeFocusItemFromFocusStackById({
        focusId: NAVIGATION_DRAWER_INPUT_FOCUS_ID,
      });
    },
    focusId: NAVIGATION_DRAWER_INPUT_FOCUS_ID,
    scope: hotkeyScope,
  });

  useListenClickOutside({
    refs: [inputRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      onClickOutside(event, value);
      removeFocusItemFromFocusStackById({
        focusId: NAVIGATION_DRAWER_INPUT_FOCUS_ID,
      });
    },
    listenerId: 'navigation-drawer-input',
  });

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (isDefined(value)) {
      event.target.select();
    }
    pushFocusItemToFocusStack({
      focusId: NAVIGATION_DRAWER_INPUT_FOCUS_ID,
      component: {
        type: FocusComponentType.TEXT_INPUT,
        instanceId: NAVIGATION_DRAWER_INPUT_FOCUS_ID,
      },
      hotkeyScope: { scope: hotkeyScope },
    });
  };

  const handleBlur = () => {
    removeFocusItemFromFocusStackById({
      focusId: NAVIGATION_DRAWER_INPUT_FOCUS_ID,
    });
  };

  return (
    <TextInputV2
      className={className}
      LeftIcon={Icon}
      ref={inputRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={handleFocus}
      onBlur={handleBlur}
      sizeVariant="md"
      fullWidth
      autoFocus
    />
  );
};
