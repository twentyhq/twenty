import { styled } from '@linaria/react';
import { type FocusEventHandler } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type TextAreaProps } from '@/ui/input/types/TextAreaProps';
import { isDefined } from 'twenty-shared/utils';
import { Field, Textarea } from 'twenty-ui/primitives/input';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const TextArea = ({
  textAreaId,
  label,
  disabled,
  height,
  placeholder,
  minRows = 1,
  maxRows,
  value = '',
  className,
  onChange,
  onFocus,
  onBlur,
  readOnly = false,
  variant = 'default',
}: TextAreaProps) => {
  const computedMinRows = isDefined(maxRows)
    ? Math.min(minRows, maxRows)
    : minRows;
  const isTransparent = variant === 'transparent';

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleFocus: FocusEventHandler<HTMLTextAreaElement> = () => {
    pushFocusItemToFocusStack({
      focusId: textAreaId,
      component: {
        type: FocusComponentType.TEXT_AREA,
        instanceId: textAreaId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    onFocus?.();
  };

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
    removeFocusItemFromFocusStackById({ focusId: textAreaId });
    onBlur?.();
  };

  return (
    <Field.Root render={<StyledContainer />}>
      {label && <Field.Label>{label}</Field.Label>}
      <Textarea
        autoResize
        rows={computedMinRows}
        maxRows={maxRows}
        variant={isTransparent ? 'plain' : 'default'}
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange?.(turnIntoEmptyStringIfWhitespacesOnly(event.target.value))
        }
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        readOnly={readOnly}
        className={className}
        style={{
          height,
        }}
      />
    </Field.Root>
  );
};
