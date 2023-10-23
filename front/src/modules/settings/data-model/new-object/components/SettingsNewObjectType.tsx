import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconBox, IconDatabase, IconFileCheck } from '@/ui/display/icon';

import { SettingsObjectTypeCard } from './SettingsObjectTypeCard';
import { SettingsStandardObjects } from './SettingsStandardObjects';

export type NewObjectType = 'Standard' | 'Custom' | 'Remote';

type SettingsNewObjectTypeProps = {
  selectedType?: NewObjectType;
  onTypeSelect?: (type: NewObjectType) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

export const SettingsNewObjectType = ({
  selectedType,
  onTypeSelect,
}: SettingsNewObjectTypeProps) => {
  const theme = useTheme();
  return (
    <>
      <StyledContainer>
        <SettingsObjectTypeCard
          title={'Standard'}
          color="blue"
          selected={selectedType === 'Standard'}
          prefixIcon={
            <IconFileCheck
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.tertiary}
            />
          }
          onClick={() => onTypeSelect?.('Standard')}
        />
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
          onClick={() => onTypeSelect?.('Custom')}
        />
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
        />
      </StyledContainer>
      {selectedType === 'Standard' && <SettingsStandardObjects />}
    </>
  );
};
