import { css, cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { type FocusEventHandler } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type FormFieldInputVariant } from '@/ui/input/types/FormFieldInputVariant';
import { isDefined } from 'twenty-shared/utils';
import { Field, Textarea } from 'twenty-ui/primitives/input';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

export type TextAreaProps = {
  textAreaId: string;
  label?: string;
  disabled?: boolean;
  height?: number;
  minRows?: number;
  maxRows?: number;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  variant?: FormFieldInputVariant;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const transparentTextareaClassName = css`
  background-color: transparent;
  border: none;
  border-radius: 0;
  line-height: inherit;
  overflow: hidden;
  padding: 0;
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
        maxRows={isTransparent ? undefined : maxRows}
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange?.(turnIntoEmptyStringIfWhitespacesOnly(event.target.value))
        }
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        readOnly={readOnly}
        className={cx(className, isTransparent && transparentTextareaClassName)}
        style={{
          height,
          maxBlockSize:
            isTransparent && isDefined(maxRows) ? `${maxRows}lh` : undefined,
        }}
      />
    </Field.Root>
  );
};
