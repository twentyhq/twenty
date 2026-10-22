import { type MouseEvent, type MouseEventHandler, type ReactNode } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { ComposerFieldRow } from 'twenty-ui/components/input';

const NESTED_CONTROL_SELECTOR = doNotTranslate(
  'input, textarea, button, a[href], [role="button"]',
);

type ActivityComposerFieldRowProps = {
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
  hasDivider?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export const ActivityComposerFieldRow = ({
  label,
  children,
  trailing,
  hasDivider,
  onClick,
}: ActivityComposerFieldRowProps) => {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const row = event.currentTarget;
    const nestedControl = event.target.closest(NESTED_CONTROL_SELECTOR);
    const isFromPortaledContent = !row.contains(event.target);
    const isOnNestedControl =
      isDefined(nestedControl) && row.contains(nestedControl);

    if (isFromPortaledContent || isOnNestedControl) {
      return;
    }

    onClick?.(event);
  };

  return (
    <ComposerFieldRow
      label={label}
      hasDivider={hasDivider}
      isHoverable={isDefined(onClick)}
      onClick={isDefined(onClick) ? handleClick : undefined}
      trailing={
        isDefined(trailing) && (
          <div onClick={(event) => event.stopPropagation()}>{trailing}</div>
        )
      }
    >
      {children}
    </ComposerFieldRow>
  );
};
