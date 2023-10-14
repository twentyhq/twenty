import React, { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  IconBox,
  IconCheck,
  IconDatabase,
  IconFileCheck,
} from '@/ui/display/icon';
import { SoonPill } from '@/ui/display/pill/components/SoonPill';
import { Tag } from '@/ui/display/tag/components/Tag';
import { ThemeColor } from '@/ui/theme/constants/colors';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(5)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const StyledObjectTypeCard = styled.div<ObjectTypeCardProps>`
  ${({ theme, disabled, selected }) => `
    background: ${theme.background.transparent.primary};
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    display: flex;
    flex-direction: row;
    font-family: ${theme.font.family};
    font-weight: 500;
    border-style: solid;
    border-width: '1px';
    padding: ${theme.spacing(3)};
    border-radius: ${theme.border.radius.sm};
    gap: ${theme.spacing(2)};
    border-color: ${
      selected
        ? theme.name === 'dark'
          ? 'white'
          : 'black'
        : theme.border.color.inverted
    };
    color: ${theme.font.color.primary};
    align-items: center;
    width: 140px;
  `}
`;

const StyledTag = styled(Tag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(5)};
`;

const StyledIconCheck = styled(IconCheck)`
  margin-left: auto;
`;

type ObjectTypeCardProps = {
  prefixIcon?: React.ReactNode;
  title: string;
  soon?: boolean;
  disabled?: boolean;
  color: ThemeColor;
  selected: boolean;
};

const ObjectTypeCard = ({
  prefixIcon,
  title,
  soon = false,
  selected,
  disabled = false,
  color,
}: ObjectTypeCardProps) => {
  const theme = useTheme();
  return (
    <StyledObjectTypeCard
      title={title}
      soon={soon}
      disabled={disabled}
      color={color}
      selected={selected}
    >
      {prefixIcon}
      <StyledTag color={color} text={title} />
      {soon && <SoonPill />}
      {!disabled && selected && <StyledIconCheck size={theme.icon.size.md} />}
    </StyledObjectTypeCard>
  );
};

export const NewObjectType = () => {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const handleCardClick = (selectedType: string) => {
    setSelectedType(selectedType);
  };
  return (
    <StyledContainer>
      <div onClick={() => handleCardClick('Standard')}>
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
        ></ObjectTypeCard>
      </div>
      <div onClick={() => handleCardClick('Custom')}>
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
        ></ObjectTypeCard>
      </div>
      <div>
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
      </div>
    </StyledContainer>
  );
};
