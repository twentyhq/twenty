import { styled } from '@linaria/atomic';

import { FeatureFlag, FlagScope } from '../types/flags.types';

type FlagListProps = {
  flags: FeatureFlag[];
  onToggle?: (flagId: string, enabled: boolean) => void;
};

const SCOPE_COLORS: Record<FlagScope, string> = {
  workspace: '#3b82f6',
  user: '#8b5cf6',
  global: '#f59e0b',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FlagRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const FlagInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FlagLabel = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const FlagKey = styled.code`
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 1px 4px;
  border-radius: 3px;
`;

const FlagDescription = styled.span`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ScopeBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => props.color};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Slider = styled.span<{ checked: boolean }>`
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: ${(props) => (props.checked ? '#22c55e' : '#d1d5db')};
  border-radius: 22px;
  transition: background 0.2s;
  &::before {
    content: '';
    position: absolute;
    height: 16px;
    width: 16px;
    left: ${(props) => (props.checked ? '20px' : '3px')};
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

export const FlagList = ({ flags, onToggle }: FlagListProps) => {
  return (
    <Container>
      {flags.map((flag) => (
        <FlagRow key={flag.id}>
          <FlagInfo>
            <FlagLabel>{flag.label}</FlagLabel>
            <FlagKey>{flag.key}</FlagKey>
            <FlagDescription>{flag.description}</FlagDescription>
          </FlagInfo>
          <RightSection>
            <ScopeBadge color={SCOPE_COLORS[flag.scope]}>
              {flag.scope}
            </ScopeBadge>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={flag.enabled}
                onChange={() => onToggle?.(flag.id, !flag.enabled)}
              />
              <Slider checked={flag.enabled} />
            </ToggleSwitch>
          </RightSection>
        </FlagRow>
      ))}
    </Container>
  );
};
