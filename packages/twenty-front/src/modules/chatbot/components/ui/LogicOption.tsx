import {
  NewLogicNodeData,
  RecordType,
} from '@/chatbot/types/LogicNodeDataType';
import { comparisonOptions } from '@/chatbot/types/condicionalOptions';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import React, { useEffect, useRef, useState } from 'react';
import { IconTrash, Label, useIcons } from 'twenty-ui/display';
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

const StyledDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};

  textarea {
    resize: none;
    width: 100%;
    padding: ${({ theme }) => theme.spacing(2)};
    border: none;
    outline: none;
    color: ${({ theme }) => theme.font.color.primary};
    font-size: ${({ theme }) => theme.font.size.sm};
    box-sizing: border-box;
    background-color: ${({ theme }) => theme.background.quaternary};
    border-radius: ${({ theme }) => theme.border.radius.sm};

    &:focus {
      border: 1px solid ${({ theme }) => theme.color.blue};
    }

    &:hover {
      cursor: pointer;
    }
  }
`;

const StyledLabel = styled(Label)`
  display: flex;
  justify-content: flex-end;
  width: 100%;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [localMessage, setLocalMessage] = useState(condition.message ?? '');
  const [recordType, setRecordType] = useState<RecordType>(
    condition.recordType ?? '',
  );

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (textareaRef.current) {
      textareaRef.current.style.height = '30px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localMessage]);

  if (!sectors) return null;

  const sectorsOptions = [
    { label: 'Choose a sector', value: '' },
    ...sectors.map((sector) => ({
      Icon: getIcon(sector.icon),
      label: sector.name,
      value: sector.id,
    })),
  ];

  const recordTypeOptions: { label: string; value: RecordType }[] = [
    { label: 'Choose record', value: '' },
    { label: 'Sectors', value: 'sectors' },
    { label: 'Text', value: 'text' },
  ];

  const handleTextBlur = () => {
    const trimmed = localMessage.trim();
    if (trimmed !== (condition.message ?? '').trim()) {
      const updated = { ...condition, message: trimmed, recordType };
      onUpdate(updated);
    }
  };

  const handleSector = (val: string) => {
    if (val !== condition.sectorId) {
      const updated = {
        ...condition,
        sectorId: val,
        recordType,
      };
      onUpdate(updated);
    }
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
          onChange={(val) => {
            onUpdate({ ...condition, comparison: val });
          }}
        />
        <Select
          label="Record"
          dropdownId={`select-record-type-${condition.option}`}
          options={recordTypeOptions}
          value={recordType}
          onChange={(val) => setRecordType(val)}
        />

        {recordType === 'sectors' && (
          <Select
            label="Options"
            dropdownId={`select-sector-condition-${condition.option}`}
            options={sectorsOptions}
            value={condition.sectorId}
            onChange={handleSector}
          />
        )}

        {recordType === 'text' && (
          <StyledDiv>
            <Label>Options</Label>
            <textarea
              ref={textareaRef}
              value={localMessage}
              onChange={(e) => setLocalMessage(e.target.value)}
              onBlur={handleTextBlur}
              maxLength={40}
            />
            <StyledLabel>{localMessage.length}/40</StyledLabel>
          </StyledDiv>
        )}
      </StyledLogicNodeWrapper>
    </>
  );
};
