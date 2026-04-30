import { styled } from '@linaria/atomic';
import { useState } from 'react';

import { FeatureFlag } from '../types/flags.types';

type BulkToggleProps = {
  flags: FeatureFlag[];
  onBulkToggle?: (flagIds: string[], enabled: boolean) => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button<{ variant: 'enable' | 'disable' }>`
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  background: ${(props) => (props.variant === 'enable' ? '#22c55e' : '#ef4444')};
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const SelectedCount = styled.span`
  font-size: 13px;
  color: #6b7280;
  margin-left: 8px;
`;

const SelectAllLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
`;

const FlagCheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const FlagName = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

const FlagStatus = styled.span<{ enabled: boolean }>`
  margin-left: auto;
  font-size: 11px;
  color: ${(props) => (props.enabled ? '#22c55e' : '#9ca3af')};
`;

export const BulkToggle = ({ flags, onBulkToggle }: BulkToggleProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelected = (flagId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(flagId)) {
        next.delete(flagId);
      } else {
        next.add(flagId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === flags.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(flags.map((f) => f.id)));
    }
  };

  const selectedIds = Array.from(selected);

  return (
    <Container>
      <ActionBar>
        <SelectAllLabel>
          <input
            type="checkbox"
            checked={selected.size === flags.length && flags.length > 0}
            onChange={toggleAll}
          />
          Select all
        </SelectAllLabel>
        <SelectedCount>{selected.size} selected</SelectedCount>
        <ActionButton
          variant="enable"
          disabled={selected.size === 0}
          onClick={() => onBulkToggle?.(selectedIds, true)}
        >
          Enable
        </ActionButton>
        <ActionButton
          variant="disable"
          disabled={selected.size === 0}
          onClick={() => onBulkToggle?.(selectedIds, false)}
        >
          Disable
        </ActionButton>
      </ActionBar>
      {flags.map((flag) => (
        <FlagCheckRow key={flag.id}>
          <input
            type="checkbox"
            checked={selected.has(flag.id)}
            onChange={() => toggleSelected(flag.id)}
          />
          <FlagName>{flag.label}</FlagName>
          <FlagStatus enabled={flag.enabled}>
            {flag.enabled ? 'ON' : 'OFF'}
          </FlagStatus>
        </FlagCheckRow>
      ))}
    </Container>
  );
};
