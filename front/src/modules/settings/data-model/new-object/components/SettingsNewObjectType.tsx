import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconBox, IconDatabase, IconFileCheck } from '@/ui/display/icon';

import { SettingsObjectTypeCard } from './SettingsObjectTypeCard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsNewObjectType = () => {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const handleCardClick = (selectedType: string) => {
    setSelectedType(selectedType);
  };
  return (
    <StyledContainer>
      <SettingsObjectTypeCard
        title="Standard"
        color="blue"
        selected={selectedType === 'Standard'}
        prefixIcon={
          <IconFileCheck
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.tertiary}
          />
        }
        onClick={() => handleCardClick('Standard')}
      ></SettingsObjectTypeCard>
      <SettingsObjectTypeCard
        title="Custom"
        color="orange"
        selected={selectedType === 'Custom'}
        prefixIcon={
          <IconBox
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.tertiary}
          />
        }
        onClick={() => handleCardClick('Custom')}
      ></SettingsObjectTypeCard>
      <SettingsObjectTypeCard
        title="Remote"
        soon
        disabled
        color="green"
        selected={selectedType === 'Remote'}
        prefixIcon={
          <IconDatabase
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.tertiary}
          />
        }
      ></SettingsObjectTypeCard>
    </StyledContainer>
  );
};
