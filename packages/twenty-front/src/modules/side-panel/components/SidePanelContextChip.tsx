import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment } from 'react/jsx-runtime';
import { type SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledChip = styled.button<{
  withText: boolean;
  maxWidth?: string;
  onClick?: () => void;
}>`
  align-items: center;
  all: unset;
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: ${({ onClick }) => (isDefined(onClick) ? 'pointer' : 'default')};
  display: flex;
  font-family: inherit;
  /* If the chip has text, we add extra padding to have a more balanced design */
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  line-height: ${themeCssVariables.text.lineHeight.lg};
  max-width: ${({ maxWidth }) => maxWidth ?? ''};

  &:hover {
    background: ${({ onClick }) =>
      isDefined(onClick)
        ? themeCssVariables.background.transparent.medium
        : themeCssVariables.background.transparent.light};
  }
  padding: 0
    ${({ withText }) =>
      withText ? themeCssVariables.spacing[2] : themeCssVariables.spacing[1]};
`;

const StyledIconsContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledEmptyText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

export type SidePanelContextChipProps = {
  Icons: React.ReactNode[];
  text?: string;
  onClick?: () => void;
  testId?: string;
  maxWidth?: string;
  forceEmptyText?: boolean;
  page?: {
    page: SidePanelPages;
    pageId: string;
  };
};

export const SidePanelContextChip = ({
  Icons,
  text,
  onClick,
  testId,
  maxWidth,
  forceEmptyText = false,
}: SidePanelContextChipProps) => {
  return (
    <StyledChip
      withText={isNonEmptyString(text)}
      onClick={onClick}
      data-testid={testId}
      maxWidth={maxWidth}
    >
      <StyledIconsContainer>
        {Icons.map((Icon, index) => (
          <Fragment key={index}>{Icon}</Fragment>
        ))}
      </StyledIconsContainer>
      {text?.trim?.() ? (
        <OverflowingTextWithTooltip text={text} />
      ) : !forceEmptyText ? (
        <StyledEmptyText>{t`Untitled`}</StyledEmptyText>
      ) : (
        ''
      )}
    </StyledChip>
  );
};
