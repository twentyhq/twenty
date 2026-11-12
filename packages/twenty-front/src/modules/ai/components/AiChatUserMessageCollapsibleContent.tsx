import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import {
  type FocusEvent,
  type ReactNode,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AI_CHAT_USER_MESSAGE_COLLAPSED_LINE_COUNT } from '@/ai/constants/AiChatUserMessageCollapsedLineCount';
import { agentChatIsUserMessageExpandedFamilyState } from '@/ai/states/agentChatIsUserMessageExpandedFamilyState';
import { isAiChatUserMessageCollapsible } from '@/ai/utils/isAiChatUserMessageCollapsible';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

const StyledContent = styled.div<{ isCollapsed: boolean }>`
  mask-image: ${({ isCollapsed }) =>
    isCollapsed
      ? 'linear-gradient(to bottom, black calc(100% - 2lh), transparent)'
      : 'none'};
  max-height: ${({ isCollapsed }) =>
    isCollapsed ? `${AI_CHAT_USER_MESSAGE_COLLAPSED_LINE_COUNT}lh` : 'none'};
  overflow: ${({ isCollapsed }) => (isCollapsed ? 'hidden' : 'visible')};
`;

const StyledToggleContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-inline: calc(-1 * ${themeCssVariables.spacing[1]});
  padding-bottom: ${themeCssVariables.spacing[1]};
`;

type AiChatUserMessageCollapsibleContentProps = {
  messageId: string;
  children: ReactNode;
};

export const AiChatUserMessageCollapsibleContent = ({
  messageId,
  children,
}: AiChatUserMessageCollapsibleContentProps) => {
  const { t } = useLingui();
  const contentId = useId();
  const toggleContainerRef = useRef<HTMLDivElement>(null);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [isExpanded, setIsExpanded] = useAtomFamilyState(
    agentChatIsUserMessageExpandedFamilyState,
    { messageId },
  );
  const scrollWrapperInstanceId = useAvailableComponentInstanceId(
    ScrollWrapperComponentInstanceContext,
  );

  const isCollapsed = isCollapsible && !isExpanded;

  // A ref callback measures during commit, so a tall message never paints at full height first.
  const observeContentHeight = useCallback(
    (contentElement: HTMLDivElement | null) => {
      if (!isDefined(contentElement)) {
        return;
      }

      const updateIsCollapsible = () => {
        setIsCollapsible(
          isAiChatUserMessageCollapsible({
            contentHeightInPx: contentElement.getBoundingClientRect().height,
            lineHeightInPx: parseFloat(
              getComputedStyle(contentElement).lineHeight,
            ),
          }),
        );
      };

      updateIsCollapsible();

      const resizeObserver = new ResizeObserver(updateIsCollapsible);

      resizeObserver.observe(contentElement);

      return () => resizeObserver.disconnect();
    },
    [],
  );

  const handleToggleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    const toggleContainerElement = toggleContainerRef.current;
    const scrollWrapperElement = isDefined(scrollWrapperInstanceId)
      ? document.getElementById(`scroll-wrapper-${scrollWrapperInstanceId}`)
      : null;

    if (
      !isDefined(toggleContainerElement) ||
      !isDefined(scrollWrapperElement)
    ) {
      setIsExpanded(false);
      return;
    }

    const toggleTopBeforeCollapseInPx =
      toggleContainerElement.getBoundingClientRect().top;

    flushSync(() => setIsExpanded(false));

    // Scrolls up by the removed height so the toggle and the messages below stay in place.
    scrollWrapperElement.scrollTop -=
      toggleTopBeforeCollapseInPx -
      toggleContainerElement.getBoundingClientRect().top;
  };

  const handleContentFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (isCollapsed && event.target.matches(':focus-visible')) {
      setIsExpanded(true);
    }
  };

  return (
    <>
      <StyledContent
        id={contentId}
        isCollapsed={isCollapsed}
        onFocus={handleContentFocus}
      >
        <div ref={observeContentHeight}>{children}</div>
      </StyledContent>
      {isCollapsible && (
        <StyledToggleContainer ref={toggleContainerRef}>
          <LightButton
            aria-controls={contentId}
            aria-expanded={isExpanded}
            onClick={handleToggleClick}
          >
            {isExpanded ? t`Show less` : t`Show more`}
          </LightButton>
        </StyledToggleContainer>
      )}
    </>
  );
};
