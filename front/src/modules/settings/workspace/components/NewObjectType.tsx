import React, { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconBox, IconCheck, IconDatabase, IconFileCheck } from '@/ui/icon';
import { SoonPill } from '@/ui/pill/components/SoonPill';
import { Tag } from '@/ui/tag/components/Tag';
import { ThemeColor } from '@/ui/theme/constants/colors';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(5)};
  padding-bottom: ${({ theme }) => theme.spacing(10)};
  padding-top: ${({ theme }) => theme.spacing(4)};
  width: 100%;
  & > div {
    flex: 1;
  }
`;

const StyledObjectTypeCard = styled.div<ObjectTypeCardProps>`
  ${({ theme, disabled, isSelected }) => `
    background: ${theme.background.transparent.primary};
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    display: flex;
    flex-direction: row;
    font-family: ${theme.font.family};
    font-weight: 500;
    border-style: solid;
    border-width: ${isSelected ? '1.5px' : '1px'};
    padding: ${theme.spacing(3)};
    border-radius: ${theme.border.radius.sm};
    gap: ${theme.spacing(4)};
    border-color: ${
      isSelected
        ? theme.name === 'dark'
          ? 'white'
          : 'black'
        : theme.border.color.light
    };
    color: ${theme.font.color.primary};
    align-items: center;
  `}
`;

const StyledTag = styled(Tag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(6)};
`;

type NewObjectTypeProps = {
  objectType: string | null;
  changeType?: (selectObjectType: string) => void; // drill down function
};

type ObjectTypeCardProps = {
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  title: string;
  soon?: boolean;
  disabled?: boolean;
  color: ThemeColor;
  isSelected: boolean;
};

const ObjectTypeCard = ({
  prefixIcon,
  title,
  soon = false,
  isSelected,
  disabled = false,
  color,
  suffixIcon,
}: ObjectTypeCardProps) => {
  const theme = useTheme();
  return (
    <StyledObjectTypeCard
      title={title}
      soon={soon}
      disabled={disabled}
      color={color}
      isSelected={isSelected}
    >
      {prefixIcon}
      <StyledTag color={color} text={title} />
      {soon && <SoonPill />}
      {!disabled &&
        (isSelected ? suffixIcon : <div style={{ width: '24px' }} />)}
    </StyledObjectTypeCard>
  );
};

export const NewObjectType = ({
  objectType,
  changeType,
}: NewObjectTypeProps) => {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const handleCardClick = (selectedType: string) => {
    if (changeType) {
      changeType(selectedType);
    }
    setSelectedType(selectedType);
  };
  return (
    <StyledContainer>
      <div onClick={() => handleCardClick('Standard')}>
        <ObjectTypeCard
          title="Standard"
          color="blue"
          isSelected={selectedType === 'Standard'}
          prefixIcon={
            <IconFileCheck
              color={
                theme.name === 'light' ? theme.color.gray50 : theme.color.gray60
              }
            />
          }
          suffixIcon={<IconCheck></IconCheck>}
        ></ObjectTypeCard>
      </div>
      <div onClick={() => handleCardClick('Custom')}>
        <ObjectTypeCard
          title="Custom"
          color="orange"
          isSelected={selectedType === 'Custom'}
          prefixIcon={
            <IconBox
              color={
                theme.name === 'light' ? theme.color.gray50 : theme.color.gray60
              }
            />
          }
          suffixIcon={<IconCheck></IconCheck>}
        ></ObjectTypeCard>
      </div>
      <div>
        <ObjectTypeCard
          title="Remote"
          soon
          disabled
          color="green"
          isSelected={selectedType === 'Remote'}
          prefixIcon={
            <IconDatabase
              color={
                theme.name === 'light' ? theme.color.gray50 : theme.color.gray60
              }
            />
          }
        ></ObjectTypeCard>
      </div>
    </StyledContainer>
  );
};
