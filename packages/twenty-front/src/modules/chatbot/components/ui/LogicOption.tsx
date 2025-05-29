import { NewLogicNodeData } from '@/chatbot/types/LogicNodeDataType';
import { comparisonOptions } from '@/chatbot/types/condicionalOptions';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import React from 'react';
import { IconTrash, useIcons } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

interface LogicOptionProps {
  nodeIndex: number;
  condition: NewLogicNodeData;
  onDelete: () => void;
  onUpdate: (updates: NewLogicNodeData) => void;
  showDeleteButton?: boolean;
}

const StyledLogicNodeWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledHeaderOption = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const LogicOption: React.FC<LogicOptionProps> = ({
  nodeIndex,
  condition,
  onDelete,
  onUpdate,
  showDeleteButton = true,
}) => {
  const { getIcon } = useIcons();
  const { sectors } = useFindAllSectors();

  if (!sectors) return;

  const defaultOption = { label: 'Choose a sector', value: '' };

  const sectorsOptions = [
    defaultOption,
    ...sectors.map((sector) => ({
      Icon: getIcon(sector.icon),
      label: sector.name,
      value: sector.id,
    })),
  ];

  const handleSectorChange = (val: string) => {
    if (val === '') return;
    onUpdate({ ...condition, sectorId: val });
  };

  return (
    <>
      <StyledHeaderOption>
        <label>Option {condition.option}</label>
        {showDeleteButton && <Button Icon={IconTrash} onClick={onDelete} />}
      </StyledHeaderOption>
      <StyledLogicNodeWrapper>
        <Select
          label="Comparison"
          dropdownId={`select-comparison-condition-${condition.option}`}
          options={comparisonOptions}
          value={condition.comparison}
          onChange={(val) => onUpdate({ ...condition, comparison: val })}
        />
        {/* Add objects and records to this container in the future */}
        <Select
          label="Sectors"
          dropdownId={`select-sector-condition-${condition.option}`}
          options={sectorsOptions}
          value={condition.sectorId}
          onChange={handleSectorChange}
        />
      </StyledLogicNodeWrapper>
    </>
  );
};
