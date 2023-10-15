import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconBox, IconDatabase, IconFileCheck } from '@/ui/display/icon';

import { ObjectTypeCard } from './ObjectTypeCard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(5)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

export const NewObjectType = () => {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const handleCardClick = (selectedType: string) => {
    setSelectedType(selectedType);
  };
  return (
    <StyledContainer>
      <ObjectTypeCard
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
      ></ObjectTypeCard>
      <ObjectTypeCard
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
      ></ObjectTypeCard>
      <ObjectTypeCard
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
      ></ObjectTypeCard>
    </StyledContainer>
  );
};
