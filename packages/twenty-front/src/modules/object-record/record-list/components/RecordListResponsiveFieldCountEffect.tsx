import { RECORD_LIST_ROW_FIELD_MAX_WIDTH } from '@/object-record/record-list/constants/RecordListRowFieldMaxWidth';
import { RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT } from '@/object-record/record-list/constants/RecordListRowVisibleFieldLimit';
import { recordListDisplayedFieldCountComponentState } from '@/object-record/record-list/states/recordListDisplayedFieldCountComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type RefObject, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

const ROW_FIELD_GAP_WIDTH = 12;
const LABEL_IDENTIFIER_RESERVED_WIDTH = 188;
const HIDDEN_FIELD_COUNT_CHIP_RESERVED_WIDTH = 40;

type RecordListResponsiveFieldCountEffectProps = {
  containerRef: RefObject<HTMLElement | null>;
};

export const RecordListResponsiveFieldCountEffect = ({
  containerRef,
}: RecordListResponsiveFieldCountEffectProps) => {
  const setRecordListDisplayedFieldCount = useSetAtomComponentState(
    recordListDisplayedFieldCountComponentState,
  );

  useEffect(() => {
    const containerElement = containerRef.current;

    if (!isDefined(containerElement)) {
      return;
    }

    const computeDisplayedFieldCount = (containerWidth: number) => {
      const availableWidthForFields =
        containerWidth -
        LABEL_IDENTIFIER_RESERVED_WIDTH -
        HIDDEN_FIELD_COUNT_CHIP_RESERVED_WIDTH;

      const fittingFieldCount = Math.floor(
        availableWidthForFields /
          (RECORD_LIST_ROW_FIELD_MAX_WIDTH + ROW_FIELD_GAP_WIDTH),
      );

      return Math.min(
        RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT,
        Math.max(1, fittingFieldCount),
      );
    };

    setRecordListDisplayedFieldCount(
      computeDisplayedFieldCount(containerElement.clientWidth),
    );

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!isDefined(entry)) {
        return;
      }

      setRecordListDisplayedFieldCount(
        computeDisplayedFieldCount(entry.contentRect.width),
      );
    });

    resizeObserver.observe(containerElement);

    return () => resizeObserver.disconnect();
  }, [containerRef, setRecordListDisplayedFieldCount]);

  return null;
};
