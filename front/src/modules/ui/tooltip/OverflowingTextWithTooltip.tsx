import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { v4 as uuidV4 } from 'uuid';

import { AppTooltip } from './AppTooltip';

const StyledOverflowingText = styled.div<{ cursorPointer: boolean }>`
  cursor: ${({ cursorPointer }) => (cursorPointer ? 'pointer' : 'inherit')};
  font-family: inherit;
  font-size: inherit;

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: inherit;

  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function OverflowingTextWithTooltip({
  text,
}: {
  text: string | null | undefined;
}) {
  const textElementId = `title-id-${uuidV4()}`;

  const textRef = useRef<HTMLDivElement>(null);

  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);

  useEffect(() => {
    const isOverflowing =
      (text?.length ?? 0) > 0 && textRef.current
        ? textRef.current?.scrollHeight > textRef.current?.clientHeight ||
          textRef.current.scrollWidth > textRef.current.clientWidth
        : false;

    if (isTitleOverflowing !== isOverflowing) {
      setIsTitleOverflowing(isOverflowing);
    }
  }, [isTitleOverflowing, text]);

  function handleTooltipClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.preventDefault();
  }

  return (
    <>
      <StyledOverflowingText
        data-testid="tooltip"
        ref={textRef}
        id={textElementId}
        cursorPointer={isTitleOverflowing}
      >
        {text}
      </StyledOverflowingText>
      {isTitleOverflowing &&
        createPortal(
          <div onClick={handleTooltipClick}>
            <AppTooltip
              anchorSelect={`#${textElementId}`}
              content={text ?? ''}
              delayHide={0}
              offset={5}
              noArrow
              place="bottom"
              positionStrategy="absolute"
            />
          </div>,
          document.body,
        )}
    </>
  );
}
