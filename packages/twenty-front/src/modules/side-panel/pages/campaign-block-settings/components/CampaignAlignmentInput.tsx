import { styled } from '@linaria/react';
import { IconAlignCenter, IconAlignLeft, IconAlignRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledCampaignFieldLabel } from '@/side-panel/pages/campaign-block-settings/components/StyledCampaignFieldLabel';

const StyledAlignRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAlignButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.transparent.medium : 'none'};
  border: 1px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.border.color.strong : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  width: 32px;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

export const CAMPAIGN_ALIGN_OPTIONS = [
  { align: 'left', Icon: IconAlignLeft },
  { align: 'center', Icon: IconAlignCenter },
  { align: 'right', Icon: IconAlignRight },
] as const;

type CampaignAlignmentInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const CampaignAlignmentInput = ({
  label,
  value,
  onChange,
}: CampaignAlignmentInputProps) => (
  <div>
    <StyledCampaignFieldLabel>{label}</StyledCampaignFieldLabel>
    <StyledAlignRow>
      {CAMPAIGN_ALIGN_OPTIONS.map(({ align, Icon }) => (
        <StyledAlignButton
          key={align}
          type="button"
          isActive={value === align}
          onClick={() => onChange(align)}
        >
          <Icon size={16} />
        </StyledAlignButton>
      ))}
    </StyledAlignRow>
  </div>
);
