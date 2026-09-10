import { type RefObject, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type MergeRecordsContentScrollResetEffectProps = {
  activeTabId: string | null;
  contentContainerRef: RefObject<HTMLDivElement | null>;
};

export const MergeRecordsContentScrollResetEffect = ({
  activeTabId,
  contentContainerRef,
}: MergeRecordsContentScrollResetEffectProps) => {
  useEffect(() => {
    if (isDefined(contentContainerRef.current)) {
      contentContainerRef.current.scrollTop = 0;
    }
  }, [activeTabId, contentContainerRef]);

  return null;
};
