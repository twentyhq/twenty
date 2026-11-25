import { styled } from '@linaria/react';
import { type ReactNode, useCallback, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

// Stays mounted while empty so removing the last file can animate; the negative
// margin cancels the composer box gap meanwhile
const StyledClip = styled.div`
  flex-shrink: 0;
  margin-bottom: calc(-1 * ${themeCssVariables.spacing[2]});
  overflow: hidden;
  transition: height calc(${themeCssVariables.animation.duration.normal} * 1s)
    ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};

  &:not(:empty) {
    padding-bottom: ${themeCssVariables.spacing[2]};
  }
`;

type ChatComposerAttachmentsProps = {
  children?: ReactNode;
};

export const ChatComposerAttachments = ({
  children,
}: ChatComposerAttachmentsProps) => {
  const clipRef = useRef<HTMLDivElement>(null);

  const observeContentHeight = useCallback(
    (contentElement: HTMLDivElement | null) => {
      if (!isDefined(contentElement)) {
        return;
      }

      const resizeObserver = new ResizeObserver(() => {
        if (isDefined(clipRef.current)) {
          clipRef.current.style.height = `${contentElement.offsetHeight}px`;
        }
      });

      resizeObserver.observe(contentElement);

      return () => resizeObserver.disconnect();
    },
    [],
  );

  return (
    <StyledClip ref={clipRef}>
      <StyledContent ref={observeContentHeight}>{children}</StyledContent>
    </StyledClip>
  );
};
