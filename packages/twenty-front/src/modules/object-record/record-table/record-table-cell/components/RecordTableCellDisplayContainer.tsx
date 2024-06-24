import { Ref } from 'react';
import clsx from 'clsx';

import styles from './RecordTableCellDisplayContainer.module.css';

export type EditableCellDisplayContainerProps = {
  softFocus?: boolean;
  onClick?: () => void;
  scrollRef?: Ref<HTMLDivElement>;
  isHovered?: boolean;
};

export const RecordTableCellDisplayContainer = ({
  children,
  softFocus,
  onClick,
  scrollRef,
}: React.PropsWithChildren<EditableCellDisplayContainerProps>) => (
  <div
    data-testid={
      softFocus ? 'editable-cell-soft-focus-mode' : 'editable-cell-display-mode'
    }
    onClick={onClick}
    className={clsx({
      [styles.cellDisplayOuterContainer]: true,
      [styles.cellDisplayWithSoftFocus]: softFocus,
    })}
    ref={scrollRef}
  >
    <div className={clsx(styles.cellDisplayInnerContainer)}>{children}</div>
  </div>
);
