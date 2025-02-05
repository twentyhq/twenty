import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  AnimatedExpandableContainer,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  LightIconButton,
} from 'twenty-ui';
type SettingsAdminEnvVariablesRowProps = {
  variable: {
    name: string;
    description: string;
    value: string;
    sensitive: boolean;
  };
};

const StyledTruncatedCell = styled(TableCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

const StyledExpandedDetails = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin: ${({ theme }) => theme.spacing(2)} 0;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacing(1)};
  height: fit-content;
  min-height: min-content;
`;

const StyledDetailLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

const StyledEllipsisLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledExpandedLabel = styled.div`
  word-break: break-word;
  white-space: normal;
  overflow: visible;
`;

const StyledTransitionedIconChevronRight = styled(IconChevronRight)`
  cursor: pointer;
  transform: ${({ $isExpanded }: { $isExpanded: boolean }) =>
    $isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: ${({ theme }) =>
    `transform ${theme.animation.duration.normal}s ease`};
`;

export const SettingsAdminEnvVariablesRow = ({
  variable,
}: SettingsAdminEnvVariablesRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSensitiveValue, setShowSensitiveValue] = useState(false);
  const theme = useTheme();

  const displayValue =
    variable.value === ''
      ? 'null'
      : variable.sensitive && !showSensitiveValue
        ? '••••••'
        : variable.value;

  const handleToggleVisibility = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowSensitiveValue(!showSensitiveValue);
  };

  return (
    <>
      <TableRow
        onClick={() => setIsExpanded(!isExpanded)}
        gridAutoColumns="4fr 3fr 2fr 1fr 1fr"
      >
        <StyledTruncatedCell color="primary">
          <StyledEllipsisLabel>{variable.name}</StyledEllipsisLabel>
        </StyledTruncatedCell>
        <StyledTruncatedCell>
          <StyledEllipsisLabel>{variable.description}</StyledEllipsisLabel>
        </StyledTruncatedCell>
        <StyledTruncatedCell>
          <StyledEllipsisLabel>{displayValue}</StyledEllipsisLabel>
        </StyledTruncatedCell>
        <TableCell align="right">
          {variable.sensitive && variable.value !== '' && (
            <LightIconButton
              Icon={showSensitiveValue ? IconEyeOff : IconEye}
              size="small"
              accent="secondary"
              onClick={handleToggleVisibility}
            />
          )}
        </TableCell>
        <TableCell align="right">
          <StyledTransitionedIconChevronRight
            $isExpanded={isExpanded}
            size={theme.icon.size.sm}
          />
        </TableCell>
      </TableRow>
      <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
        <StyledExpandedDetails>
          <StyledDetailLabel>Name:</StyledDetailLabel>
          <StyledEllipsisLabel>{variable.name}</StyledEllipsisLabel>
          <StyledDetailLabel>Description:</StyledDetailLabel>
          <StyledExpandedLabel>{variable.description}</StyledExpandedLabel>
          <StyledDetailLabel>Value:</StyledDetailLabel>
          <StyledExpandedLabel>{displayValue}</StyledExpandedLabel>
        </StyledExpandedDetails>
      </AnimatedExpandableContainer>
    </>
  );
};
