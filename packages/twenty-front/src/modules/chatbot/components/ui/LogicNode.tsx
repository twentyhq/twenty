/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {
  comparisonOptions,
  conditionOptions,
} from '@/chatbot/types/condicionalOptions';
import { LogicNodeData } from '@/chatbot/types/LogicNodeDataType';
import { Select, SelectValue } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { memo, ReactNode, useEffect, useState } from 'react';
import { useIcons } from 'twenty-ui';

const StyledLogicNodeWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;

  p {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledInputsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledInput = styled.input`
  resize: none;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  border: none;
  outline: none;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.md};

  &:focus {
    border: 1px solid ${({ theme }) => theme.color.blue};
  }

  &:hover {
    cursor: pointer;
  }
`;

const StyledSelect = styled(Select)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledButton = styled.button`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  height: 100%;

  span {
    align-items: center;
    display: flex;
    color: ${({ theme }) => theme.background.primaryInverted};
  }

  &:hover {
    background-color: ${({ theme }) => theme.background.secondary};
  }

  &:active {
    background-color: ${({ theme }) => theme.background.tertiary};
    border: 1px solid ${({ theme }) => theme.color.blue};
  }

  &:disabled {
    pointer-events: none;
    background-color: ${({ theme }) => theme.background.quaternary};
  }
`;

const IconButton = ({
  icon,
  onClick,
  disabled,
  size,
}: {
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  size: number;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(icon);

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <span>
        <Icon size={size} />
      </span>
    </StyledButton>
  );
};

function LogicNode({
  dropdownId,
  onGroupsChange,
  children,
}: {
  dropdownId: string;
  onGroupsChange: (groups: LogicNodeData[]) => void;
  children: ReactNode;
}) {
  const [groups, setGroups] = useState<LogicNodeData[]>([
    { conditionValue: '', comparison: '==', inputText: '', outgoingEdgeId: '' },
  ]);

  useEffect(() => {
    onGroupsChange(groups);
  }, [groups]);

  const handleAddGroup = () => {
    setGroups((prevGroups) => [
      ...prevGroups,
      { conditionValue: '&&', comparison: '==', inputText: '' },
    ]);
  };

  const handleRemoveGroup = () => {
    if (groups.length > 1) {
      setGroups(groups.slice(0, -1));
    }
  };

  const handleConditionChange = (index: number, value: SelectValue) => {
    const updatedGroups = [...groups];
    updatedGroups[index].conditionValue = value ? String(value) : '';
    setGroups(updatedGroups);
  };

  const handleComparisonChange = (index: number, value: string) => {
    const updatedGroups = [...groups];
    updatedGroups[index].comparison = value;
    setGroups(updatedGroups);
  };

  const handleInputTextChange = (index: number, value: string) => {
    const updatedGroups = [...groups];
    updatedGroups[index].inputText = value;
    setGroups(updatedGroups);
  };

  return (
    <StyledLogicNodeWrapper>
      <p>A mensagem recebida deve ser</p>

      {groups.map((group, index) => (
        <div key={index}>
          {index > 0 && (
            <StyledSelect
              dropdownId={`${dropdownId}-condition-${index}`}
              options={conditionOptions}
              value={group.conditionValue}
              onChange={(event) => handleConditionChange(index, event)}
            />
          )}
          <StyledInputsWrapper>
            <Select
              dropdownId={`${dropdownId}-comparison-${index}`}
              options={comparisonOptions}
              value={group.comparison}
              onChange={(event) => handleComparisonChange(index, event)}
            />
            <StyledInput
              type="text"
              value={group.inputText}
              onChange={(event) =>
                handleInputTextChange(index, event.target.value)
              }
              placeholder="Digite o texto para comparar"
            />
          </StyledInputsWrapper>
        </div>
      ))}

      <StyledButtonWrapper>
        <IconButton icon={'IconPlus'} size={18} onClick={handleAddGroup} />
        <IconButton
          icon={'IconMinus'}
          size={18}
          onClick={handleRemoveGroup}
          disabled={groups.length <= 1}
        />
      </StyledButtonWrapper>

      <div style={{ position: 'absolute', right: '0' }}>{children}</div>
    </StyledLogicNodeWrapper>
  );
}

export default memo(LogicNode);
