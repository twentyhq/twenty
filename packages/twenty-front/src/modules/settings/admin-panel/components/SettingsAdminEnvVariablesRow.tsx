import { SettingsAdminEnvCopyableText } from '@/settings/admin-panel/components/SettingsAdminEnvCopyableText';
import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
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
  isExpanded: boolean;
  onExpandToggle: (name: string) => void;
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

const StyledEllipsisLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledValueContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: space-between;
  width: 100%;
`;

const StyledTableRow = styled(TableRow)<{ isExpanded: boolean }>`
  background-color: ${({ isExpanded, theme }) =>
    isExpanded ? theme.background.transparent.light : 'transparent'};
`;

const StyledExpandableContainer = styled.div`
  width: 100%;
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminEnvVariablesRow = ({
  variable,
  isExpanded,
  onExpandToggle,
}: SettingsAdminEnvVariablesRowProps) => {
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

  const environmentVariablesDetails = [
    {
      label: 'Name',
      value: <SettingsAdminEnvCopyableText text={variable.name} />,
    },
    {
      label: 'Description',
      value: (
        <SettingsAdminEnvCopyableText
          text={variable.description}
          maxRows={1}
          multiline={true}
        />
      ),
    },
    {
      label: 'Value',
      value: (
        <StyledValueContainer>
          <SettingsAdminEnvCopyableText
            text={variable.value}
            displayText={displayValue}
            multiline={true}
          />
          {variable.sensitive && variable.value !== '' && (
            <LightIconButton
              Icon={showSensitiveValue ? IconEyeOff : IconEye}
              size="small"
              accent="secondary"
              onClick={handleToggleVisibility}
            />
          )}
        </StyledValueContainer>
      ),
    },
  ];

  return (
    <>
      <StyledTableRow
        onClick={() => onExpandToggle(variable.name)}
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
          <StyledButton
            onClick={(e) => {
              e.stopPropagation();
              onExpandToggle(variable.name);
            }}
          >
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
        <StyledExpandableContainer>
          <SettingsAdminTableCard
            items={environmentVariablesDetails}
            gridAutoColumns="1fr 4fr"
          />
        </StyledExpandableContainer>
      </AnimatedExpandableContainer>
    </>
  );
};
