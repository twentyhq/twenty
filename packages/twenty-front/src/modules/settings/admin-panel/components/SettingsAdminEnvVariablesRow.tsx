import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
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

const StyledButton = styled(motion.button)`
  align-items: center;
  border: none;
  display: flex;
  justify-content: center;
  padding-inline: ${({ theme }) => theme.spacing(1)};
  background-color: transparent;
  height: 24px;
  width: 24px;
  box-sizing: border-box;
  cursor: pointer;
`;

const MotionIconChevronDown = motion(IconChevronRight);

const StyledExpandedDetails = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
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
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
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

const StyledValueContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledTableRow = styled(TableRow)<{ isExpanded: boolean }>`
  background-color: ${({ isExpanded, theme }) =>
    isExpanded ? theme.background.transparent.light : 'transparent'};
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
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
      <StyledTableRow
        onClick={() => setIsExpanded(!isExpanded)}
        gridAutoColumns="5fr 4fr 3fr 1fr"
        isExpanded={isExpanded}
      >
        <StyledTruncatedCell color={theme.font.color.primary}>
          <StyledEllipsisLabel>{variable.name}</StyledEllipsisLabel>
        </StyledTruncatedCell>
        <StyledTruncatedCell>
          <StyledEllipsisLabel>{variable.description}</StyledEllipsisLabel>
        </StyledTruncatedCell>
        <StyledTruncatedCell align="right">
          <StyledEllipsisLabel>{displayValue}</StyledEllipsisLabel>
        </StyledTruncatedCell>
        <TableCell align="right">
          <StyledButton onClick={() => setIsExpanded(!isExpanded)}>
            <MotionIconChevronDown
              size={theme.icon.size.md}
              color={theme.font.color.tertiary}
              initial={false}
              animate={{ rotate: isExpanded ? 90 : 0 }}
            />
          </StyledButton>
        </TableCell>
      </StyledTableRow>
      <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
        <StyledExpandedDetails>
          <StyledDetailLabel>Name</StyledDetailLabel>
          <StyledEllipsisLabel>{variable.name}</StyledEllipsisLabel>
          <StyledDetailLabel>Description</StyledDetailLabel>
          <StyledExpandedLabel>{variable.description}</StyledExpandedLabel>
          <StyledDetailLabel>Value</StyledDetailLabel>
          <StyledExpandedLabel>
            <StyledValueContainer>
              {displayValue}
              {variable.sensitive && variable.value !== '' && (
                <LightIconButton
                  Icon={showSensitiveValue ? IconEyeOff : IconEye}
                  size="small"
                  accent="secondary"
                  onClick={handleToggleVisibility}
                />
              )}
            </StyledValueContainer>
          </StyledExpandedLabel>
        </StyledExpandedDetails>
      </AnimatedExpandableContainer>
    </>
  );
};
