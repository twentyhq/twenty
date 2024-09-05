import { StyledEllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import { useRef, useState } from 'react';
import { AppTooltip, TooltipDelay } from 'twenty-ui';

type EllipsisTextWithTooltipProps = {
  labelId: string;
  text: string;
};

const EllipsisTextWithTooltip = ({
  labelId,
  text,
}: EllipsisTextWithTooltipProps) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const checkIsOverflowing = () => {
    if (textRef.current !== null) {
      const { offsetWidth, scrollWidth } = textRef.current;

      const isOverflowing = scrollWidth > offsetWidth;

      return isOverflowing;
    }

    return false;
  };

  const handleMouseEnter = () => {
    const isOverflowing = checkIsOverflowing();

    if (isOverflowing) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <StyledEllipsisDisplay ref={textRef} id={labelId}>
          {text}
        </StyledEllipsisDisplay>
        {showTooltip && (
          <AppTooltip
            anchorSelect={`#${labelId}`}
            content={text}
            isOpen
            clickable
            noArrow
            place="bottom"
            positionStrategy="fixed"
            delay={TooltipDelay.shortDelay}
          />
        )}
      </div>
    </>
  );
};

export default EllipsisTextWithTooltip;
