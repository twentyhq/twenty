import { useNavigateToMoreWidgets } from '@/page-layout/hooks/useNavigateToMoreWidgets';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';
import { FloatingIconButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const INSERT_BUTTON_CLASS_NAME = css`
  background: ${themeCssVariables.background.transparent.primary};
  border-color: ${themeCssVariables.background.transparent.light};
  flex-shrink: 0;
  opacity: 0;
  pointer-events: none;
`;

const StyledSeparator = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  overflow: visible;
  padding-inline: ${themeCssVariables.spacing[4]};
  position: relative;
  z-index: 4;

  &::before,
  &::after {
    background: ${themeCssVariables.border.color.strong};
    border-radius: ${themeCssVariables.border.radius.pill};
    content: '';
    flex: 1;
    height: 1px;
    opacity: 0;
  }

  &:hover,
  &:focus-within {
    &::before,
    &::after,
    .${INSERT_BUTTON_CLASS_NAME} {
      opacity: 1;
    }

    .${INSERT_BUTTON_CLASS_NAME} {
      pointer-events: auto;
    }
  }

  @media (hover: none) {
    &::before,
    &::after,
    .${INSERT_BUTTON_CLASS_NAME} {
      opacity: 1;
    }

    .${INSERT_BUTTON_CLASS_NAME} {
      pointer-events: auto;
    }
  }
`;

type RecordPageWidgetInsertionSeparatorProps = {
  widget: Pick<PageLayoutWidget, 'id' | 'title'>;
};

export const RecordPageWidgetInsertionSeparator = ({
  widget,
}: RecordPageWidgetInsertionSeparatorProps) => {
  const { navigateToMoreWidgets } = useNavigateToMoreWidgets();

  return (
    <StyledSeparator>
      <FloatingIconButton
        className={INSERT_BUTTON_CLASS_NAME}
        aria-label={t`Add widget above ${widget.title}`}
        size="sm"
        onClick={() =>
          navigateToMoreWidgets({
            targetWidgetId: widget.id,
            direction: 'above',
          })
        }
      >
        <IconPlus />
      </FloatingIconButton>
    </StyledSeparator>
  );
};
