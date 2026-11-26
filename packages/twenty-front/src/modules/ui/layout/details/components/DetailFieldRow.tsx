import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const DETAIL_FIELD_LABEL_WIDTH_PX = 92;

const StyledDetailFieldRow = styled.div`
  align-items: center;
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: ${DETAIL_FIELD_LABEL_WIDTH_PX}px minmax(0, 1fr);
  min-height: ${themeCssVariables.spacing[6]};
`;

export const StyledDetailFieldLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const StyledDetailFieldValue = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: 0;
`;

type DetailFieldRowProps = {
  Icon: IconComponent;
  label: string;
  children: ReactNode;
};

export const DetailFieldRow = ({
  Icon,
  label,
  children,
}: DetailFieldRowProps) => {
  const theme = useTheme();

  return (
    <StyledDetailFieldRow>
      <StyledDetailFieldLabel>
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        <OverflowingTextWithTooltip text={label} />
      </StyledDetailFieldLabel>
      <StyledDetailFieldValue>{children}</StyledDetailFieldValue>
    </StyledDetailFieldRow>
  );
};
